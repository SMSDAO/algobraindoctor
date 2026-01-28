import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { IdentificationCard } from '@phosphor-icons/react'
import { useState } from 'react'
import { IdentityClaimType } from '@/lib/types'
import { toast } from 'sonner'

interface ClaimModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (claim: {
    identityType: string
    handle: string
    claimType: IdentityClaimType
    evidence: string
  }) => void
}

export function ClaimModal({ open, onOpenChange, onSubmit }: ClaimModalProps) {
  const [identityType, setIdentityType] = useState('github')
  const [handle, setHandle] = useState('')
  const [claimType, setClaimType] = useState<IdentityClaimType>('contributor')
  const [evidence, setEvidence] = useState('')

  const handleSubmit = () => {
    if (!handle.trim()) {
      toast.error('Handle is required')
      return
    }

    onSubmit({
      identityType,
      handle: handle.trim(),
      claimType,
      evidence: evidence.trim(),
    })

    setHandle('')
    setEvidence('')
    onOpenChange(false)
    toast.success('Identity claim submitted for verification')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg bg-card/95 backdrop-blur-md neon-border-violet glow-violet">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-space flex items-center gap-2">
            <IdentificationCard size={24} className="sm:w-7 sm:h-7 text-[var(--aura-violet)]" />
            <span className="hidden sm:inline">Submit Identity Claim</span>
            <span className="sm:hidden">New Claim</span>
          </DialogTitle>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Link your identity to repositories and establish governance rights
          </div>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="identity-type" className="text-xs sm:text-sm">Identity Type</Label>
            <Select value={identityType} onValueChange={setIdentityType}>
              <SelectTrigger id="identity-type" className="text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="handle" className="text-xs sm:text-sm">Handle / Address</Label>
            <Input
              id="handle"
              placeholder="e.g., octocat or 0x..."
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="font-mono text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="claim-type" className="text-xs sm:text-sm">Claim Type</Label>
            <Select
              value={claimType}
              onValueChange={(value) => setClaimType(value as IdentityClaimType)}
            >
              <SelectTrigger id="claim-type" className="text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="maintainer">Maintainer</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="governor">Governor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="evidence" className="text-xs sm:text-sm">Evidence (Optional)</Label>
            <Textarea
              id="evidence"
              placeholder="Provide links, commit SHAs, or other proof..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={4}
              className="font-mono text-[10px] sm:text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 neon-border-violet glow-violet hover:brightness-110 text-xs sm:text-sm"
            >
              Submit Claim
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
