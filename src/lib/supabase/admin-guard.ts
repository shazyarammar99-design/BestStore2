import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminUser, isEmailAdmin } from '@/lib/admin/auth';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return supabaseResponse;
}

export async function guardAdminRoute(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  const isApi = pathname.startsWith('/api/admin');
  if (!pathname.startsWith('/admin') && !isApi) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (isApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const login = new URL('/login', request.url);
    login.searchParams.set('redirect', pathname);
    return NextResponse.redirect(login);
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const login = new URL('/login', request.url);
    login.searchParams.set('redirect', pathname);
    return NextResponse.redirect(login);
  }

  if (isEmailAdmin(user.email)) return null;

  const allowed = await isAdminUser(user);
  if (!allowed) {
    if (isApi) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const home = new URL('/', request.url);
    home.searchParams.set('error', 'admin_forbidden');
    return NextResponse.redirect(home);
  }

  return null;
}
