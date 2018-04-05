Bundle with:

```
DATABASE_SCHEMAS="app_public" DATABASE_URL="postgres://localhost/lambda_example" npm run bundle
```

Then upload lambda.zip (~3.9MB) to lambda and set the handler to `index.handler`

Make sure you set the DATABASE_SCHEMAS and DATABASE_URL envvars on Lambda too!
