"use client"

export function DocumentPreview() {
  return (
    <div className="h-full">
      <div className="bg-muted/20 rounded-lg p-4 h-full border border-border/30">
        {/* Document page simulation */}
        <div className="bg-card/50 rounded-lg p-5 border border-border/20 min-h-[280px] shadow-lg">
          <p className="font-mono text-xs font-semibold text-foreground mb-4">
            QSC Form 2 - Statement of Claim
          </p>
          
          {/* Simulated document lines */}
          <div className="space-y-2.5">
            <div className="h-2 bg-muted/50 rounded-full w-[92%]" />
            <div className="h-2 bg-muted/50 rounded-full w-[74%]" />
            <div className="h-2 bg-muted/50 rounded-full w-[55%]" />
            <div className="h-2 bg-muted/50 rounded-full w-[92%]" />
            <div className="h-2 bg-primary/60 rounded-full w-[48%]" /> {/* Redacted - highlighted */}
            <div className="h-2 bg-muted/50 rounded-full w-[74%]" />
            <div className="h-2 bg-muted/50 rounded-full w-[92%]" />
            <div className="h-2 bg-muted/50 rounded-full w-[55%]" />
          </div>

          {/* Field grid */}
          <div className="grid grid-cols-2 gap-2 mt-6">
            <FieldPill label="Matter" value="ACL-1042" />
            <FieldPill label="Type" value="Pleadings" />
            <FieldPill label="Source" value="M365 inbox" />
            <FieldPill label="Privacy" value="3 refs redacted" />
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-md px-3 py-2 border border-border/20">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-xs font-medium text-foreground mt-0.5">{value}</p>
    </div>
  )
}
