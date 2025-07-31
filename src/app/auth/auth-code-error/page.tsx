export default function AuthCodeError() {
  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: 'auto', paddingTop: '100px', textAlign: 'center' }}>
      <h2>Authentication Error</h2>
      <p>The sign-in link is invalid or has expired.</p>
      <p>Please try signing in again.</p>
    </div>
  )
}