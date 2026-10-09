import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',workers:1,use:{baseURL:process.env.APP_URL??'http://localhost:3000'},webServer:{command:'npm run dev -- --hostname 127.0.0.1',url:'http://localhost:3000/api/health',reuseExistingServer:!process.env.CI},reporter:[['list'],['html',{open:'never'}]]});
