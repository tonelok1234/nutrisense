"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pill, Clock, Loader2 } from "lucide-react"

interface MedicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export default function MedicationDialog({ open, onOpenChange, userId }: MedicationDialogProps) {
  const [name, setName] = useState("")
  const [dosage, setDosage] = useState("")
  const [type, setType] = useState("supplement")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${name}${type !== "other" ? ` (${type})` : ""}`,
          dosage,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save medication")
      }

      onOpenChange(false)

      // Reset form
      setName("")
      setDosage("")
      setType("supplement")
      setNotes("")
    } catch (error) {
      console.error("[v0] Error saving medication:", error)
      alert("Kunne ikkje lagre medikament. Prøv igjen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-purple-500" />
            Registrer medikament eller tilskudd
          </DialogTitle>
          <DialogDescription>Logg medisin, vitamin eller kosttilskudd du tek</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="med-type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Vel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medication">Medikament</SelectItem>
                <SelectItem value="supplement">Kosttilskudd</SelectItem>
                <SelectItem value="vitamin">Vitamin</SelectItem>
                <SelectItem value="mineral">Mineral</SelectItem>
                <SelectItem value="herbal">Naturmedisin</SelectItem>
                <SelectItem value="other">Anna</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="med-name">Namn</Label>
            <Input
              id="med-name"
              placeholder="F.eks. Vitamin D, Paracet, Omega-3..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="med-dosage">Dosering (valfritt)</Label>
            <Input
              id="med-dosage"
              placeholder="F.eks. 1000IE, 500mg, 2 tablettar..."
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="med-notes">Notat (valfritt)</Label>
            <Textarea
              id="med-notes"
              placeholder="Eventuelle merknader..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Tidspunkt: {new Date().toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lagrar...
              </>
            ) : (
              "Registrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
