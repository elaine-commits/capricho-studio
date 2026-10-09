import {test,expect} from '@playwright/test';
test('health and login page respond',async({request})=>{expect((await request.get('/api/health')).status()).toBe(200);expect(await (await request.get('/login')).text()).toContain('Acesso Capricho Imports');});
test('anonymous APIs are protected',async({request})=>{for(const path of ['/api/auth/me','/api/records/products'])expect((await request.get(path)).status()).toBe(401);});
test('cross-origin login rejected',async({request})=>{expect((await request.post('/api/auth/login',{headers:{Origin:'https://unauthorized.example'},data:{email:'test@example.com',password:'invalid'}})).status()).toBe(403);});
