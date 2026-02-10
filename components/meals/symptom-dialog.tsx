"use client"

import type React from "react"
import { useState, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HeartPulse, Clock, Loader2, Camera, X, Brain } from "lucide-react"

interface SymptomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export default function SymptomDialog({ open, onOpenChange, userId }: SymptomDialogProps) {
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("medium")
  const [category, setCategory] = useState("general")
  const [photo, setPhoto] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
        analyzePhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzePhoto = async (imageData: string) => {
    setIsAnalyzing(true)
    setAiAnalysis(null)

    // Mock AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setAiAnalysis(
      "AI har analysert biletet: Ser ut som raudheit/irritasjon på huda. Mogleg allergisk reaksjon eller kontaktdermatitt. Anbefalt: Spor matvarer og produkt dei siste 24 timane for å identifisere mogleg årsak.",
    )
    setIsAnalyzing(false)
  }

  const clearPhoto = () => {
    setPhoto(null)
    setAiAnalysis(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!description.trim() && !photo) return

    setIsSubmitting(true)

    try {
      const severityMap: Record<string, number> = { low: 3, medium: 5, high: 8 }
      
      const response = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: `[${category}] ${description}`,
          severity: severityMap[severity] || 5,
          image_url: photo,
          notes: aiAnalysis || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save symptom")
      }

      onOpenChange(false)

      // Reset form
      setDescription("")
      setSeverity("medium")
      setCategory("general")
      setPhoto(null)
      setAiAnalysis(null)
    } catch (error) {
      console.error("[v0] Error saving symptom:", error)
      alert("Kunne ikkje lagre symptom. Prøv igjen.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-orange-500" />
            Registrer symptom
          </DialogTitle>
          <DialogDescription>Logg symptom og ta bilete for AI-analyse</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Generelt</SelectItem>
                  <SelectItem value="digestive">Fordøyelse</SelectItem>
                  <SelectItem value="skin">Hud</SelectItem>
                  <SelectItem value="headache">Hovudpine</SelectItem>
                  <SelectItem value="fatigue">Trøyttleik</SelectItem>
                  <SelectItem value="mood">Humør</SelectItem>
                  <SelectItem value="pain">Smerte</SelectItem>
                  <SelectItem value="allergy">Allergi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Alvorlegheit</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Mild</SelectItem>
                  <SelectItem value="medium">Moderat</SelectItem>
                  <SelectItem value="high">Alvorleg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Beskriving</Label>
            <Textarea
              placeholder="Beskriv symptoma dine... F.eks. hovudpine, magetrøbbel, utslett, trøyttleik..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label>Bilete (valfritt)</Label>
            {photo ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={photo || "/placeholder.svg"}
                    alt="Symptom"
                    className="w-full max-h-40 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={clearPhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    <span className="text-sm">AI analyserer biletet...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-sm">AI-analyse</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{aiAnalysis}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handlePhotoCapture}
                  className="hidden"
                  id="symptom-photo"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Ta bilete av symptom
                </Button>
              </>
            )}
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
          <Button onClick={handleSubmit} disabled={isSubmitting || (!description.trim() && !photo)}>
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
