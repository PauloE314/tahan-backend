import path from 'path';

const image_path = path.resolve(__dirname, '..', '..', 'uploads');

export default {
    port: 3000,
    image_host: `http://localhost:3000/uploads/`,
    image_path,
    secret_key: "zKRk85IqOdErrmR4",
    jwtTime: "1d"
}