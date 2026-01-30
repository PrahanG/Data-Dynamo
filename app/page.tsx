"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Store, Warehouse, Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [retailLoginData, setRetailLoginData] = useState({ retailId: "", password: "" })
  const [warehouseLoginData, setWarehouseLoginData] = useState({ username: "", password: "" })
  const [signupData, setSignupData] = useState({
    shopName: "",
    retailId: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
  })
  const [errorMessage, setErrorMessage] = useState("")

  const handleRetailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (retailLoginData.retailId && retailLoginData.password) {
      localStorage.setItem(
        "currentRetail",
        JSON.stringify({
          id: retailLoginData.retailId,
          name: `Retail Shop ${retailLoginData.retailId}`,
        }),
      )
      router.push("/retailer")
    }
  }

  const handleWarehouseLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (warehouseLoginData.username === "warehouse_admin" && warehouseLoginData.password === "warehouse") {
      localStorage.setItem(
        "warehouseAuth",
        JSON.stringify({
          id: "WH001",
          name: "Walmart Central Warehouse",
          role: "admin",
        }),
      )
      router.push("/truck")
    } else {
      setErrorMessage("Invalid warehouse credentials!")
    }
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (signupData.password !== signupData.confirmPassword) {
      setErrorMessage("Passwords do not match!")
      return
    }

    if (signupData.shopName && signupData.retailId) {
      localStorage.setItem(
        "currentRetail",
        JSON.stringify({
          id: signupData.retailId,
          name: signupData.shopName,
        }),
      )
      // Redirect to /retailer instead of non-existent /dashboard
      router.push("/retailer")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
              <img
                src="/logo_cargovision.jpg"
                alt="CargoVision Logo"
                className="w-48 h-auto object-contain rounded-lg"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CargoVision</h1>
          <p className="text-zinc-400">Global Retail-Warehouse Network</p>
        </div>

        <Tabs defaultValue="retail-login" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="retail-login" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
              Retail
            </TabsTrigger>
            <TabsTrigger value="warehouse-login" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
              Warehouse
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400">
              New Shop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="retail-login" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800 shadow-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Store className="h-5 w-5 text-blue-500" />
                  Retail Login
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Access your shop dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRetailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="retailId" className="text-zinc-300">Retail ID</Label>
                    <Input
                      id="retailId"
                      placeholder="Enter retail ID"
                      value={retailLoginData.retailId}
                      onChange={(e) => setRetailLoginData({ ...retailLoginData, retailId: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={retailLoginData.password}
                      onChange={(e) => setRetailLoginData({ ...retailLoginData, password: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouse-login" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800 shadow-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Warehouse Admin
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Authorized personnel only
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWarehouseLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouseUsername" className="text-zinc-300">Username</Label>
                    <Input
                      id="warehouseUsername"
                      placeholder="warehouse_admin"
                      value={warehouseLoginData.username}
                      onChange={(e) => setWarehouseLoginData({ ...warehouseLoginData, username: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-red-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warehousePassword" className="text-zinc-300">Password</Label>
                    <Input
                      id="warehousePassword"
                      type="password"
                      placeholder="Warehouse password"
                      value={warehouseLoginData.password}
                      onChange={(e) => setWarehouseLoginData({ ...warehouseLoginData, password: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-red-500"
                      required
                    />
                  </div>
                  {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Access System
                  </Button>
                  <div className="text-xs text-zinc-500 text-center mt-4 bg-zinc-950 p-2 rounded border border-zinc-800">
                    Demo: warehouse_admin / warehouse
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800 shadow-none">
              <CardHeader>
                <CardTitle className="text-white">New Retail Account</CardTitle>
                <CardDescription className="text-zinc-400">
                  Register your shop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopName" className="text-zinc-300">Shop Name</Label>
                      <Input
                        id="shopName"
                        placeholder="Shop Name"
                        value={signupData.shopName}
                        onChange={(e) => setSignupData({ ...signupData, shopName: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-green-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRetailId" className="text-zinc-300">Retail ID</Label>
                      <Input
                        id="newRetailId"
                        placeholder="Retail ID"
                        value={signupData.retailId}
                        onChange={(e) => setSignupData({ ...signupData, retailId: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-zinc-300">Address</Label>
                    <Input
                      id="address"
                      placeholder="Address"
                      value={signupData.address}
                      onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-zinc-300">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-green-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-zinc-300">Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-green-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}