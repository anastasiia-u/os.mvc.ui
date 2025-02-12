import { HttpRequest } from '@angular/common/http';

// Please insert ALB JWT token below to get AuthZ token back (only for localhost)
export const LOCAL_OIDC_TOKEN = 'eyJ0eXAiOiJKV1QiLCJraWQiOiJiOGM0YjQ0NC1jNmQ0LTRiNmQtYTEzYy01NWQ1YzMzOTQ0NDUiLCJhbGciOiJFUzI1NiIsImlzcyI6Imh0dHBzOi8vY21pY29tcGFzLm9rdGEuY29tIiwiY2xpZW50IjoiMG9hMXJ6c2w4cTlrR285MkUwaDgiLCJzaWduZXIiOiJhcm46YXdzOmVsYXN0aWNsb2FkYmFsYW5jaW5nOnVzLWVhc3QtMTo1MzMwMTU3NzI2NzY6bG9hZGJhbGFuY2VyL2FwcC9zYWFzLW1haW4tc2hhcmVkLWFsYi1kZXYvZDJiMGE1MzI5YWQ0YjYwMyIsImV4cCI6MTY4NjMxODMyNn0=.eyJzdWIiOiIwMHUxc2N2MGpuaWdITFpyMjBoOCIsIm5hbWUiOiJUYXJhcyBLcmFzbnl0c2lhIiwibG9jYWxlIjoiZW5fVVMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ0a3Jhc255dHNpYUBjb21wYXMtaW5jLmNvbSIsImdpdmVuX25hbWUiOiJUYXJhcyIsImZhbWlseV9uYW1lIjoiS3Jhc255dHNpYSIsInpvbmVpbmZvIjoiQW1lcmljYS9Mb3NfQW5nZWxlcyIsInVwZGF0ZWRfYXQiOjE2ODYwNjkyMzYsImV4cCI6MTY4NjMxODMyNiwiaXNzIjoiaHR0cHM6Ly9jbWljb21wYXMub2t0YS5jb20ifQ==.9g_gvNMpqyYNqicO8XKAa72eD_ZeEgq8b5Cw-c_Q2cn1WhcWLQUKgf0k9zIE61VgV3lcyWJ_j91Ze5W4VEr4hQ==';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function configureForLocalAuth(request: HttpRequest<any>): HttpRequest<any> {
  const localToken = LOCAL_OIDC_TOKEN;

  if (!localToken) {
    throw new Error('Local OIDC token is not provided');
  }

  return request.clone({
    setHeaders: {
      'x-local-env': 'true',
      'x-amzn-oidc-local-data': localToken,
    }
  });
}
