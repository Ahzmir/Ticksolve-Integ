import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if the user is accessing an admin route
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Get the user data from session storage
        const user = request.cookies.get('user');
        
        try {
            if (!user) {
                return NextResponse.redirect(new URL('/', request.url));
            }
            
            const userData = JSON.parse(decodeURIComponent(user.value));
            
            // Check if the user is an admin
            if (userData.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch (error) {
            // If there's any error parsing the user data, redirect to login
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*'
};
