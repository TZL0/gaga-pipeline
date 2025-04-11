import os
import io
import imaplib
import email
from email.header import decode_header
import base64
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image
import smtplib
from email.message import EmailMessage
from werkzeug.utils import secure_filename

IMAP_SERVER = "imap.privateemail.com"
IMAP_PORT = 993
SMTP_SERVER = "smtp.privateemail.com"
SMTP_PORT = 465
EMAIL_ACCOUNT = "gaga@tianze.li"
EMAIL_PASSWORD = "gagagaga"
ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".heif", ".heic"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    content = exc.detail if isinstance(exc.detail, dict) else {"error": exc.detail}
    return JSONResponse(status_code=exc.status_code, content=content)

class PullImagesRequest(BaseModel):
    code: str

def convert_and_resize_image(image_bytes):
    with Image.open(io.BytesIO(image_bytes)) as img:
        if img.mode not in ['RGB', 'RGBA']:
            img = img.convert('RGB')

        try:
            resample_filter = Image.Resampling.LANCZOS
        except AttributeError:
            resample_filter = Image.ANTIALIAS

        img.thumbnail((1024, 1024), resample_filter)
        out_buffer = io.BytesIO()
        img.save(out_buffer, format='PNG')
        out_buffer.seek(0)
        return out_buffer.read()

@app.get("/")
def index():
    return "Welcome to the GAGA Postal API!"

@app.post("/pull_images")
def pull_images(payload: PullImagesRequest):
    code = payload.code

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
        mail.select("inbox")
        status, messages = mail.search(None, f'(HEADER Subject "{code}")')
        if status != "OK":
            mail.logout()
            raise HTTPException(status_code=500, detail="Error searching inbox.")

        email_ids = messages[0].split()
        if not email_ids:
            mail.logout()
            raise HTTPException(
                status_code=404,
                detail="It might take a while to arrive. No emails found with the code so far."
            )

        latest_email_id = email_ids[-1]
        status, msg_data = mail.fetch(latest_email_id, "(RFC822)")
        if status != "OK":
            mail.logout()
            raise HTTPException(status_code=500, detail="Error fetching the email.")

        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)

        image_data_urls = []
        for part in msg.walk():
            if part.get_content_maintype() == "multipart":
                continue
            content_disp = part.get("Content-Disposition")
            if not part.get_filename() and (content_disp is None or "attachment" not in content_disp.lower()):
                continue

            filename = part.get_filename()
            if filename:
                decoded_filename, encoding = decode_header(filename)[0]
                if isinstance(decoded_filename, bytes):
                    decoded_filename = decoded_filename.decode(encoding or "utf-8")
                ext = os.path.splitext(decoded_filename)[1].lower()
                if ext in ALLOWED_EXTENSIONS:
                    attachment_data = part.get_payload(decode=True)
                    try:
                        processed = convert_and_resize_image(attachment_data)
                        b64_encoded = base64.b64encode(processed).decode("utf-8")
                        data_url = "data:image/png;base64," + b64_encoded
                        image_data_urls.append(data_url)
                    except Exception as img_err:
                        print(f"Error processing attachment {decoded_filename}: {img_err}")
                        continue

        mail.logout()

        if not image_data_urls:
            raise HTTPException(status_code=404, detail="No valid image attachments found")

        return {"images": image_data_urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send_file")
def send_file(email: str = Form(...), file: UploadFile = File(...)):
    if not email:
        raise HTTPException(status_code=400, detail="Email address is required")

    if not file:
        raise HTTPException(status_code=400, detail="No file attached")

    filename = secure_filename(file.filename)
    try:
        file_content = file.file.read()

        msg = EmailMessage()
        msg['Subject'] = 'Your Game Asset Files'
        msg['From'] = EMAIL_ACCOUNT
        msg['To'] = email

        text = """Dear 26th STePS Participant,

Thank you for exploring our innovative Game Asset Generative AI Pipeline (MComp-FYP-11)! We hope you enjoyed the creative journey with our tools as much as we enjoyed building them.

We’re excited to share the generated files with you—simply unzip the attached package and upload the .glb file to https://glb.ee/ to view your assets in 3D.

We’d be thrilled if you could also support us by voting at https://uvents.nus.edu.sg/event/26th-steps/vote. (Please note that registration at https://uvents.nus.edu.sg/event/26th-steps/registration is required before voting.) Your support not only encourages our team but also helps us continue to push the boundaries of creative technology.

Have a fantastic day ahead!

Best regards,
Troy Tim, Ng Qi Ting, Li Tianze
"""

        html = """\
<html>
  <body>
    <p>Dear 26th STePS Participant,</p>
    <p>Thank you for exploring our innovative <strong>Game Asset Generative AI Pipeline (MComp-FYP-11)</strong>! We hope you enjoyed the creative journey with our tools as much as we enjoyed building them.</p>
    <p>We’re excited to share the generated files with you—simply unzip the attached package and upload the <code>.glb</code> file to <a href="https://glb.ee/"><strong>https://glb.ee/</strong></a> to view your assets in 3D.</p>
    <p>We’d be thrilled if you could also support us by voting at <a href="https://uvents.nus.edu.sg/event/26th-steps/vote"><strong>https://uvents.nus.edu.sg/event/26th-steps/vote</strong></a>. (Please note that registration at <a href="https://uvents.nus.edu.sg/event/26th-steps/registration"><strong>https://uvents.nus.edu.sg/event/26th-steps/registration</strong></a> is required before voting.) Your support not only encourages our team but also helps us continue to push the boundaries of creative technology.</p>
    <p>Have a fantastic day ahead!</p>
    <p>Best regards,<br>
       Troy Tim, Ng Qi Ting, Li Tianze</p>
  </body>
</html>

"""

        msg.set_content(text)
        msg.add_alternative(html, subtype='html')

        msg.add_attachment(file_content,
                           maintype='application',
                           subtype='octet-stream',
                           filename=filename)

        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Email sent successfully"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('api:app', port=8099, reload=True, workers=4)
