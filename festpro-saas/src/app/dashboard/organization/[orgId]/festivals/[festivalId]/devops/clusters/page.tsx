"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getClusterNodes, getClusterServices, getContainerImages } from "@/lib/actions/devops"
import type { ClusterNode, ClusterService, ContainerImage } from "@/types/devops"
import { CLUSTER_NODE_STATUSES, CLUSTER_SERVICE_STATUSES, CONTAINER_IMAGE_STATUSES } from "@/config/devops"
import { Loader2, Server, Globe, Container, HardDrive, Database, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ClustersPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [nodes, setNodes] = useState<ClusterNode[]>([])
  const [services, setServices] = useState<ClusterService[]>([])
  const [images, setImages] = useState<ContainerImage[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [nRes, sRes, iRes] = await Promise.all([getClusterNodes(), getClusterServices(), getContainerImages()])
    if (nRes.data) setNodes(nRes.data)
    if (sRes.data) setServices(sRes.data)
    if (iRes.data) setImages(iRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const readyNodes = nodes.filter((n) => n.status === "ready").length
  const healthyServices = services.filter((s) => s.status === "running").length
  const vulnerableImages = images.filter((i) => i.status === "vulnerable").length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cluster Dashboard</h1>
          <p className="text-sm text-gray-500">Kubernetes cluster monitoring and management</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-green-50"><Server className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold">{readyNodes}/{nodes.length}</p><p className="text-xs text-gray-500">Nodes Ready</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-50"><Globe className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{healthyServices}/{services.length}</p><p className="text-xs text-gray-500">Services Running</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-rose-50"><AlertTriangle className="h-5 w-5 text-rose-600" /></div><div><p className="text-2xl font-bold">{vulnerableImages}</p><p className="text-xs text-gray-500">Vulnerable Images</p></div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Cluster Nodes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nodes.map((n) => {
                const cfg = CLUSTER_NODE_STATUSES.find((s) => s.value === n.status)
                return (
                  <div key={n.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-sm">{n.node_name}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.color}`}>{cfg?.label || n.status}</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>{n.node_role}</span>
                        <span>{n.k8s_version}</span>
                        <span>{n.cpu_usage_percent}% CPU</span>
                        <span>{n.memory_usage_percent}% Mem</span>
                        <span>{n.pod_count}/{n.pod_capacity} pods</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {nodes.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No cluster nodes</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Services</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.map((s) => {
                const cfg = CLUSTER_SERVICE_STATUSES.find((st) => st.value === s.status)
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-sm">{s.service_name}</span>
                        <span className="text-xs text-gray-400">{s.namespace}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.color}`}>{cfg?.label || s.status}</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>Type: {s.service_type}</span>
                        <span>{s.available_replicas}/{s.replicas} replicas</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {services.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No services</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Container Images</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {images.map((img) => {
              const cfg = CONTAINER_IMAGE_STATUSES.find((s) => s.value === img.status)
              return (
                <div key={img.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Container className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm">{img.image_name}:{img.image_tag}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.color}`}>{cfg?.label || img.status}</span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      <span>{(img.size_bytes / 1024 / 1024).toFixed(1)} MB</span>
                      {img.critical_vulnerabilities > 0 && <span className="text-red-500">{img.critical_vulnerabilities} critical</span>}
                      {img.high_vulnerabilities > 0 && <span className="text-orange-500">{img.high_vulnerabilities} high</span>}
                    </div>
                  </div>
                </div>
              )
            })}
            {images.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No container images</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
