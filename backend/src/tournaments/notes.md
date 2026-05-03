## Integration notes

- Plug `ValidationPipe({ transform: true, whitelist: true })` globally.
- Configure Swagger with `SwaggerModule.createDocument()` in the application bootstrap.
- Bind NextAuth-derived user context into `req.user` before guards run.
- Replace the in-memory cache/service stubs with actual Redis and Socket.IO adapters.
- Replace the repository mock implementation with Prisma Client queries and transactions.
