import { sendFrontend } from '../messaging';

export function promptDownload(data: any) {
  sendFrontend('download', data);
}
