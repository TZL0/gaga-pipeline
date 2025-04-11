FROM node:18 AS build

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

ENV REACT_APP_GEN_IMAGE=/generate_image
ENV REACT_APP_GEN_IMAGE_STATUS=/generate_image_status
ENV REACT_APP_GEN3D_NO_PREVIEW=/gen_3d_no_preview
ENV REACT_APP_GEN3D_STATUS=/gen_3d_status
ENV REACT_APP_GEN3D_DOWNLOAD_MODEL=/gen_3d_download_model
ENV REACT_APP_POST_PROCESSING=/post_processing
ENV REACT_APP_DRAG_DIFF_TRAIN_LORA=/drag_diff_train_lora
ENV REACT_APP_DRAG_DIFF_TRAIN_LORA_STATUS=/drag_diff_train_lora_status
ENV REACT_APP_DRAG_DIFF_IMAGE=/drag_diff_image
ENV REACT_APP_DRAG_DIFF_IMAGE_STATUS=/drag_diff_image_status
ENV REACT_APP_BACKGROUND_REMOVAL=/remove_background
ENV REACT_APP_BACKGROUND_REMOVAL_STATUS=/remove_background_status
ENV REACT_APP_PULL_IMAGES=/pull_images
ENV REACT_APP_SEND_FILE=/send_file

RUN yarn build

FROM nginx:1.27.4-alpine
COPY --from=build /app/build /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]