export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Features</li>
              <li>Pricing</li>
              <li>Security</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About</li>
              <li>Blog</li>
              <li>Careers</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Documentation</li>
              <li>Help Center</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy</li>
              <li>Terms</li>
              <li>Status</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
          © {new Date().getFullYear()} Octree. All rights reserved.
        </div>
      </div>
    </footer>
  )
} 