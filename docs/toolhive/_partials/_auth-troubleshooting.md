### Authentication issues

If clients can't authenticate:

1. Check that the JWT token is valid and not expired
2. Verify that the audience and issuer match your configuration
3. Ensure the JWKS URL is accessible
4. Check the server logs for specific authentication errors:

   ```bash
   thv logs <server-name>
   ```

### Authorization issues

If authenticated clients are denied access:

1. Make sure your Cedar policies explicitly permit the specific action
   (remember, default deny)
2. Check that the principal, action, and resource match what's in your policies
   (including case and formatting)
3. Examine any conditions in your policies to ensure they're satisfied (for
   example, required JWT claims or tool arguments)
4. Remember that Cedar uses a default deny policy—if no policy explicitly
   permits an action, it will be denied

**Troubleshooting tip:** If access is denied, check that your policies
explicitly permit the action. Cedar uses a default deny model—if no policy
matches, the request is denied.
