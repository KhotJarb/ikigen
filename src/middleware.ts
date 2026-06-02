import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // ลบบรรทัดที่ผมให้เติมทิ้งไปเลยครับ เอาแค่นี้พอ
  matcher: ['/', '/(en|ja|th)/:path*'],
};