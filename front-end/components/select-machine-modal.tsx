"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Machine {
  id: string
  name: string
  powerConsumption: number // kW
}

interface SelectMachineModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (electricityCost: number, totalCost: number) => void
  quantity: string
}

export default function SelectMachineModal({ isOpen, onClose, onSelect, quantity }: SelectMachineModalProps) {
  const [selectedMachine, setSelectedMachine] = useState<string>("")
  const [minutes, setMinutes] = useState<string>("60") // Default to 60 minutes (1 hour)
  const [hours, setHours] = useState<string>("1.000000") // Default to 1 hour with 6 decimal places
  const [powerConsumption, setPowerConsumption] = useState<number>(0)
  const [energyUsage, setEnergyUsage] = useState<number>(0)
  const [electricityRate, setElectricityRate] = useState<string>("4.4")
  const [costPerUnit, setCostPerUnit] = useState<number>(0)
  const [totalCost, setTotalCost] = useState<number>(0)
  const [quantityNum, setQuantityNum] = useState<number>(1)

  // Sample machine data
  const machines: Machine[] = [
    { id: "m1", name: "เครื่องจักรแบบใช้มือ", powerConsumption: 1.2 },
    { id: "m2", name: "เครื่องจักรแบบอัตโนมัติ", powerConsumption: 1.4 },
  ]

  // Convert minutes to hours with 6 decimal places
  const convertMinutesToHours = (mins: number): string => {
    const hoursValue = mins / 60
    return hoursValue.toFixed(6)
  }

  // Convert hours to minutes
  const convertHoursToMinutes = (hrs: number): string => {
    const minutesValue = Math.round(hrs * 60)
    return minutesValue.toString()
  }

  // Handle minutes input change
  const handleMinutesChange = (value: string) => {
    setMinutes(value)
    const minutesNum = Number.parseInt(value) || 0
    setHours(convertMinutesToHours(minutesNum))
  }

  useEffect(() => {
    // Extract number from quantity string (e.g., "100 ใบ" -> 100)
    if (quantity) {
      const match = quantity.match(/\d+/)
      if (match) {
        setQuantityNum(Number.parseInt(match[0], 10))
      }
    }
  }, [quantity])

  useEffect(() => {
    // Calculate energy usage (kWh)
    const hoursNum = Number.parseFloat(hours) || 0
    const energyUsageValue = powerConsumption * hoursNum
    setEnergyUsage(energyUsageValue)

    // Calculate cost per unit (บาท)
    const electricityRateNum = Number.parseFloat(electricityRate) || 0
    const costPerUnitValue = energyUsageValue * electricityRateNum
    setCostPerUnit(costPerUnitValue)

    // Calculate total cost (บาท)
    const totalCostValue = costPerUnitValue * quantityNum
    setTotalCost(totalCostValue)
  }, [powerConsumption, hours, electricityRate, quantityNum])

  const handleMachineChange = (value: string) => {
    setSelectedMachine(value)
    const machine = machines.find((m) => m.id === value)
    if (machine) {
      setPowerConsumption(machine.powerConsumption)
    }
  }

  const handleSave = () => {
    onSelect(costPerUnit, totalCost)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg">
        <DialogHeader className="bg-teal-400 text-black p-4">
          <DialogTitle className="text-center text-xl">เลือกเครื่องจักร</DialogTitle>
          <DialogDescription className="sr-only">เลือกเครื่องจักรสำหรับการผลิต</DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <Label htmlFor="production-quantity" className="block mb-2">
                จำนวนที่ผลิต
              </Label>
              <Input id="production-quantity" type="text" value={quantity} disabled className="bg-gray-100" />
            </div>

            <div className="col-span-1">
              <Label htmlFor="machine-select" className="block mb-2">
                เลือกเครื่องจักร
              </Label>
              <Select value={selectedMachine} onValueChange={handleMachineChange}>
                <SelectTrigger id="machine-select">
                  <SelectValue placeholder="เลือกเครื่องจักร" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="col-span-1">
              <Label htmlFor="minutes-input" className="block mb-2">
                เวลาที่ใช้ผลิต (นาที)
              </Label>
              <Input
                id="minutes-input"
                type="number"
                min="1"
                step="1"
                value={minutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                className="text-center"
              />
              <p className="text-xs text-gray-500 mt-1">เทียบเท่า {hours} ชั่วโมง (1 นาที = 0.016667 ชั่วโมง)</p>
            </div>
          </div>

          <div className="grid grid-cols-5 items-center gap-2">
            <div className="col-span-2">
              <Input value={powerConsumption.toString()} readOnly className="bg-gray-100 text-center" />
              <Label className="text-xs text-center block mt-1">พลังงานที่ใช้ต่องาน (kW)</Label>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="text-xl">×</span>
            </div>
            <div className="col-span-1">
              <Input value={hours} readOnly className="bg-gray-100 text-center" />
              <Label className="text-xs text-center block mt-1">เวลาที่ใช้ผลิต (ชม.)</Label>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="text-xl">=</span>
            </div>
            <div className="col-span-2">
              <Input value={energyUsage.toFixed(6)} readOnly className="bg-gray-100 text-center" />
              <Label className="text-xs text-center block mt-1">ค่าไฟต่องาน (kWh)</Label>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="text-xl">×</span>
            </div>
            <div className="col-span-1">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                className="text-center"
              />
              <Label className="text-xs text-center block mt-1">ค่าพลังงานไฟฟ้า เช่น 4.4</Label>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="text-xl">=</span>
            </div>
            <div className="col-span-2">
              <Input value={costPerUnit.toFixed(6)} readOnly className="bg-gray-100 text-center" />
              <Label className="text-xs text-center block mt-1">ค่าไฟต่องาน (บาท)</Label>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="text-xl">×</span>
            </div>
            <div className="col-span-1">
              <Input value={quantityNum.toString()} readOnly className="bg-gray-100 text-center" />
              <Label className="text-xs text-center block mt-1">จำนวนงาน</Label>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="text-xl">=</span>
            </div>
            <div className="col-span-2">
              <Input value={totalCost.toFixed(6)} readOnly className="bg-gray-100 text-center" />
              <Label className="text-xs text-center block mt-1">ค่าไฟรวม(บาท)</Label>
            </div>
          </div>

          <div className="flex justify-between pt-4 mt-6">
            <Button onClick={onClose} className="bg-yellow-300 hover:bg-yellow-400 text-black px-6 w-full mr-2">
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              className="bg-teal-400 hover:bg-teal-500 text-black px-6 w-full ml-2"
              disabled={!selectedMachine}
            >
              บันทึก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
