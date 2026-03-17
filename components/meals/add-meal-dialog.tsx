"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, Loader2, Mic, MicOff, Barcode, Sparkles, Search, PenLine } from "lucide-react"
import { analyzeMealPhoto } from "@/app/actions/ai-meal-actions"

interface AddMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  defaultMealType?: string
  defaultInputMethod?: "barcode" | "voice" | "auto" | "manual" | null
  defaultDescription?: string
}

export default function AddMealDialog({
  open,
  onOpenChange,
  userId,
  defaultMealType = "breakfast",
  defaultInputMethod = null,
  defaultDescription = "",
}: AddMealDialogProps) {
  const [mealType, setMealType] = useState(defaultMealType)
  const [description, setDescription] = useState(defaultDescription)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>(
    defaultInputMethod === "manual" ? "manual" : defaultInputMethod || "photo",
  )

  const [barcodeValue, setBarcodeValue] = useState("")
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null)
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false)
  const [isScanningBarcode, setIsScanningBarcode] = useState(false)
  const [barcodeVideoRef, setBarcodeVideoRef] = useState<HTMLVideoElement | null>(null)

  const [autoFillQuery, setAutoFillQuery] = useState("")
  const [autoFillResults, setAutoFillResults] = useState<any[]>([])
  const [selectedAutoFill, setSelectedAutoFill] = useState<any>(null)
  const [isSearchingAutoFill, setIsSearchingAutoFill] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (defaultDescription) {
      setDescription(defaultDescription)
    }
  }, [defaultDescription])

  useEffect(() => {
    if (defaultInputMethod) {
      setActiveTab(defaultInputMethod === "auto" ? "auto" : defaultInputMethod)
    }
  }, [defaultInputMethod])

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "no-NO"

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript))
        setIsListening(false)
      }

      recognitionInstance.onerror = () => {
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const toggleVoiceRecording = () => {
    if (!recognition) {
      alert("Talegjenkjenning er ikkje støtta i denne nettlesaren")
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startBarcodeScanner = async () => {
    try {
      setIsScanningBarcode(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      
      if (barcodeVideoRef) {
        barcodeVideoRef.srcObject = stream
        barcodeVideoRef.play()
      }
    } catch (error) {
      console.error("[v0] Error starting camera:", error)
      alert("Kunne ikkje starte kameraet. Sjekk at du har gitt tilgang.")
      setIsScanningBarcode(false)
    }
  }

  const stopBarcodeScanner = () => {
    if (barcodeVideoRef?.srcObject) {
      const stream = barcodeVideoRef.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      barcodeVideoRef.srcObject = null
    }
    setIsScanningBarcode(false)
  }

  const captureBarcode = async () => {
    if (!barcodeVideoRef) return
    
    // Create canvas to capture frame
    const canvas = document.createElement('canvas')
    canvas.width = barcodeVideoRef.videoWidth
    canvas.height = barcodeVideoRef.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.drawImage(barcodeVideoRef, 0, 0)
    
    // In a real implementation, you would use a barcode detection library
    // For now, simulate detection with a mock barcode
    const mockDetectedBarcodes = ["7038010000508", "7037203629502", "7622210449283", "5701977000014"]
    const detectedBarcode = mockDetectedBarcodes[Math.floor(Math.random() * mockDetectedBarcodes.length)]
    
    setBarcodeValue(detectedBarcode)
    stopBarcodeScanner()
    
    // Auto-search the detected barcode
    setIsSearchingBarcode(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    handleBarcodeSearchWithValue(detectedBarcode)
  }

  const handleBarcodeSearchWithValue = async (value: string) => {
    setIsSearchingBarcode(true)
    try {
      const res = await fetch(`/api/food-search?barcode=${encodeURIComponent(value)}`)
      const data = await res.json()
      if (data.product) {
        setBarcodeProduct({ ...data.product, per: data.product.serving_size || "100g" })
      } else {
        setBarcodeProduct({ name: `Produkt ${value}`, calories: 0, protein: 0, carbs: 0, fat: 0, per: "100g" })
      }
    } catch {
      setBarcodeProduct({ name: `Produkt ${value}`, calories: 0, protein: 0, carbs: 0, fat: 0, per: "100g" })
    } finally {
      setIsSearchingBarcode(false)
    }
  }

  const handleBarcodeSearch = async () => {
    if (!barcodeValue.trim()) return
    await handleBarcodeSearchWithValue(barcodeValue)
  }

  const handleAutoFillSearch = async () => {
    if (!autoFillQuery.trim()) return

    setIsSearchingAutoFill(true)
    try {
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(autoFillQuery)}`)
      const data = await res.json()
      setAutoFillResults(data.products || [])
    } catch {
      setAutoFillResults([])
    } finally {
      setIsSearchingAutoFill(false)
    }
  }

  const handleSubmit = async () => {
    setIsAnalyzing(true)

    try {
      let photoData = null
      if (photo) {
        const reader = new FileReader()
        photoData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(photo)
        })
      }

      let finalDescription = description
      if (activeTab === "barcode" && barcodeProduct) {
        finalDescription = `${barcodeProduct.name} - ${barcodeProduct.calories} kcal, ${barcodeProduct.protein}g protein, ${barcodeProduct.carbs}g karbo, ${barcodeProduct.fat}g feitt per ${barcodeProduct.per}`
      } else if (activeTab === "auto" && selectedAutoFill) {
        finalDescription = `${selectedAutoFill.name} - ${selectedAutoFill.calories} kcal, ${selectedAutoFill.protein}g protein, ${selectedAutoFill.carbs}g karbo, ${selectedAutoFill.fat}g feitt`
      }

      const result = await analyzeMealPhoto({
        mealType,
        description: finalDescription,
        photoData,
      })

      if (result && 'needsMoreInfo' in result && result.needsMoreInfo) {
        alert(result.error || "Skriv inn meir informasjon om måltidet.")
        setIsAnalyzing(false)
        return
      }

      onOpenChange(false)
      router.refresh()

      // Reset form
      setMealType("breakfast")
      setDescription("")
      setPhoto(null)
      setPhotoPreview(null)
      setBarcodeValue("")
      setBarcodeProduct(null)
      setAutoFillQuery("")
      setAutoFillResults([])
      setSelectedAutoFill(null)
    } catch (error) {
      console.error("[v0] Error logging meal:", error)
      alert("Kunne ikkje logge måltid. Prøv igjen.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const canSubmit = () => {
    if (activeTab === "barcode") return barcodeProduct !== null
    if (activeTab === "auto") return selectedAutoFill !== null
    if (activeTab === "voice") return description.trim() !== ""
    if (activeTab === "manual") return description.trim() !== ""
    return photo !== null || description.trim() !== ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Logg måltid</DialogTitle>
          <DialogDescription>Vel korleis du vil registrere måltidet</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="mealType">Måltidstype</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue placeholder="Vel måltidstype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Frukost</SelectItem>
                <SelectItem value="lunch">Lunsj</SelectItem>
                <SelectItem value="dinner">Middag</SelectItem>
                <SelectItem value="snack">Mellommåltid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="manual" className="text-xs sm:text-sm">
                <PenLine className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Manuell</span>
              </TabsTrigger>
              <TabsTrigger value="photo" className="text-xs sm:text-sm">
                <Camera className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Bilete</span>
              </TabsTrigger>
              <TabsTrigger value="barcode" className="text-xs sm:text-sm">
                <Barcode className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Strekkode</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="text-xs sm:text-sm">
                <Mic className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Tale</span>
              </TabsTrigger>
              <TabsTrigger value="auto" className="text-xs sm:text-sm">
                <Sparkles className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Søk</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label>Kva har du ete?</Label>
                <Textarea
                  placeholder="Beskriv måltidet ditt, t.d. 'Havregraut med blåbær og honning, eit glass appelsinjus'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  AI vil analysere beskrivinga di og estimere næringsinnhald automatisk
                </p>
              </div>
            </TabsContent>

            <TabsContent value="photo" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label>Måltidsbilete</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      {photoPreview ? <Upload className="h-4 w-4 mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                      {photoPreview ? "Byt bilete" : "Last opp bilete"}
                    </label>
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
                {photoPreview && (
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Måltid"
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label>Beskriving (valfritt)</Label>
                <Textarea
                  placeholder="Beskriv måltidet..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="barcode" className="space-y-4 mt-4">
              {isScanningBarcode ? (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
                    <video
                      ref={(el) => setBarcodeVideoRef(el)}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3/4 h-1/3 border-2 border-white/70 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={captureBarcode} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Ta bilete
                    </Button>
                    <Button variant="outline" onClick={stopBarcodeScanner} className="bg-transparent">
                      Avbryt
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Plasser strekkoden innanfor ramma og trykk "Ta bilete"
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  <Button
                    onClick={startBarcodeScanner}
                    variant="outline"
                    className="w-full h-20 bg-transparent border-dashed"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="h-6 w-6" />
                      <span className="text-sm">Skann strekkode med kamera</span>
                    </div>
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">eller skriv inn manuelt</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Strekkode (t.d. 7038010000508)"
                      value={barcodeValue}
                      onChange={(e) => setBarcodeValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleBarcodeSearch()}
                    />
                    <Button onClick={handleBarcodeSearch} disabled={isSearchingBarcode}>
                      {isSearchingBarcode ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
              {barcodeProduct && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{barcodeProduct.name}</h4>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-center p-2 bg-background rounded">
                        <div className="font-bold text-primary">{barcodeProduct.calories}</div>
                        <div className="text-xs text-muted-foreground">kcal</div>
                      </div>
                      <div className="text-center p-2 bg-background rounded">
                        <div className="font-bold text-blue-500">{barcodeProduct.protein}g</div>
                        <div className="text-xs text-muted-foreground">protein</div>
                      </div>
                      <div className="text-center p-2 bg-background rounded">
                        <div className="font-bold text-orange-500">{barcodeProduct.carbs}g</div>
                        <div className="text-xs text-muted-foreground">karbo</div>
                      </div>
                      <div className="text-center p-2 bg-background rounded">
                        <div className="font-bold text-yellow-500">{barcodeProduct.fat}g</div>
                        <div className="text-xs text-muted-foreground">feitt</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">per {barcodeProduct.per}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="voice" className="space-y-4 mt-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <Button
                  type="button"
                  variant={isListening ? "default" : "outline"}
                  size="lg"
                  onClick={toggleVoiceRecording}
                  className={`h-24 w-24 rounded-full ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}`}
                >
                  {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {isListening ? "Lyttar... Snakk no" : "Trykk for å starte taleopptak"}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Transkripsjon</Label>
                <Textarea
                  placeholder="Det du seier vil visast her..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="auto" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label>Søk etter matvare</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="T.d. havregrøt, laks, pasta..."
                    value={autoFillQuery}
                    onChange={(e) => setAutoFillQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAutoFillSearch()}
                  />
                  <Button onClick={handleAutoFillSearch} disabled={isSearchingAutoFill}>
                    {isSearchingAutoFill ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {autoFillResults.length > 0 && (
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {autoFillResults.map((food) => (
                    <Card
                      key={food.id}
                      className={`cursor-pointer transition-colors hover:bg-primary/5 ${
                        selectedAutoFill?.id === food.id ? "border-primary bg-primary/10" : ""
                      }`}
                      onClick={() => setSelectedAutoFill(food)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <span className="font-medium">{food.name}</span>
                        <span className="text-sm text-muted-foreground">{food.calories} kcal</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {selectedAutoFill && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{selectedAutoFill.name}</h4>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-center p-2 bg-background rounded">
                        <div className="font-bold text-primary">{selectedAutoFill.calories}</div>
                        <div className="text-xs text-muted-foreground">kcal</div>
                      </div>
                      <div className="text-center p-2 bg-background rounded">
                        <div className="font-bold text-blue-500">{selectedAutoFill.protein}g</div>
                        <div className="text-xs text-muted-foreground">protein</div>
                      </div>
                      <div className="text-center p-2 bg-background rounded">
                        <div className="font-bold text-orange-500">{selectedAutoFill.carbs}g</div>
                        <div className="text-xs text-muted-foreground">karbo</div>
                      </div>
                      <div className="text-center p-2 bg-background rounded">
                        <div className="font-bold text-yellow-500">{selectedAutoFill.fat}g</div>
                        <div className="text-xs text-muted-foreground">feitt</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAnalyzing}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={isAnalyzing || !canSubmit()}>
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyserer...
              </>
            ) : (
              "Logg måltid"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
