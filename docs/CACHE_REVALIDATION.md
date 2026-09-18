# Cache Revalidation Guide

## Why is this needed?

Next.js uses Incremental Static Regeneration (ISR) to cache pages for better performance. The interview detail pages have a `revalidate = 3600` setting, which means they are cached for 1 hour.

When you make database changes (like adding the `faq` field to a view), the cached pages won't reflect these changes until they're revalidated.

## How to force revalidation

### Method 1: API Route (Recommended)

Use the `/api/revalidate` endpoint to manually trigger cache revalidation for a specific page:

```bash
curl -X POST https://etfnexo.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/entrevistas/your-interview-slug"
  }'
```

**Example:**
```bash
curl -X POST https://etfnexo.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/entrevistas/entendiendo-en-profundidad-los-etfs-y-como-utilizarlos-en-el-mercado-actual"
  }'
```

### Method 2: Wait for automatic revalidation

Pages will automatically revalidate after 1 hour (3600 seconds). Just wait for the cache to expire naturally.

### Method 3: Redeploy

Trigger a new deployment to clear all caches:

```bash
# From the project root
vercel --prod
```

## Common scenarios

### After database migration

If you update database views or add new columns:

1. Execute the migration in Supabase Dashboard
2. Use the API route to revalidate affected pages
3. Verify the changes are visible

### After updating interview content

Changes made through the admin panel will automatically revalidate the page because the update action calls `revalidatePath()`.

### After changing FAQ data

FAQ data changes trigger automatic revalidation, but if you see stale data:

```bash
curl -X POST https://etfnexo.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"path": "/entrevistas/YOUR_SLUG_HERE"}'
```

## Security

The API route accepts an optional `secret` parameter. If you want to protect this endpoint:

1. Add `REVALIDATE_SECRET` to your environment variables
2. Include it in your requests:

```bash
curl -X POST https://etfnexo.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/entrevistas/your-slug",
    "secret": "your-secret-here"
  }'
```

## Troubleshooting

**Q: I revalidated but still see old content**
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check the response from the API - it should return `{"revalidated": true}`
- Verify the path is correct (must start with `/`)

**Q: The API returns 404**
- Make sure the deployment is complete
- Check that `app/api/revalidate/route.ts` exists in production

**Q: Changes don't appear after revalidation**
- Verify the database actually has the new data
- Check that the view includes the new columns
- Ensure the API is fetching from the correct view
