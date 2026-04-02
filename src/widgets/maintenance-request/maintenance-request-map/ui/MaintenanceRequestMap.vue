<template>
  <el-card shadow="never" class="request-map">
    <div class="request-map__header">
      <div>
        <h3 class="request-map__title">Карта заявок</h3>
        <p class="request-map__subtitle">Объекты обслуживания и их география</p>
      </div>
    </div>

    <div v-if="loading" class="request-map__skeleton" />
    <div v-else ref="mapRoot" class="request-map__container"></div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { MaintenanceRequest } from '@/entities/maintenance-request/model/maintenance-request.types'

export default Vue.extend({
  name: 'MaintenanceRequestMap',

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      map: null as L.Map | null,
      markersLayer: null as L.MarkerClusterGroup | null,
      markersMap: new Map<number, L.Marker>()
    }
  },

  computed: {
    items(): MaintenanceRequest[] {
      return this.$store.getters['maintenanceRequest/filteredItems']
    },

    highlightedRequestId(): number | null {
      return this.$store.state.maintenanceRequest.highlightedRequestId
    }
  },

  mounted() {
    if (!this.loading) {
      this.$nextTick(() => {
        this.initMap()
        this.renderMarkers()
      })
    }
  },

  beforeDestroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  },

  watch: {
    loading(value: boolean) {
      if (value) {
        if (this.map) {
          this.map.remove()
          this.map = null
        }
        this.markersLayer = null
        this.markersMap.clear()
        return
      }

      this.$nextTick(() => {
        this.initMap()
        this.renderMarkers()
      })
    },

    items: {
      handler() {
        if (this.loading) return
        this.renderMarkers()
      },
      deep: true
    },

    highlightedRequestId() {
      if (this.loading) return
      this.updateHighlight()
    }
  },

  methods: {
    initMap() {
      if (this.map) return

      const root = this.$refs.mapRoot as HTMLDivElement | undefined
      if (!root) return

      this.map = L.map(root).setView([47.5, 54.5], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map)

      this.markersLayer = L.markerClusterGroup()
      this.map.addLayer(this.markersLayer)
    },

    getMarkerColor(status: MaintenanceRequest['status']): string {
      if (status === 'new') return '#409EFF'
      if (status === 'in_progress') return '#E6A23C'
      if (status === 'completed') return '#67C23A'
      return '#F56C6C'
    },

    createMarkerIcon(color: string, isHighlighted: boolean) {
      const size = isHighlighted ? 16 : 12
      const shadow = isHighlighted
        ? '0 0 0 4px rgba(64,158,255,0.25)'
        : '0 0 0 1px rgba(0,0,0,0.15)'

      return L.divIcon({
        className: 'custom-marker-icon',
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:${shadow};"></div>`,
        iconSize: [size + 4, size + 4],
        iconAnchor: [size / 2 + 2, size / 2 + 2]
      })
    },

    updateHighlight() {
      this.markersMap.forEach((marker, id) => {
        const item = this.items.find((request) => request.id === id)
        if (!item) return

        marker.setIcon(
          this.createMarkerIcon(this.getMarkerColor(item.status), this.highlightedRequestId === id)
        )
      })
    },

    renderMarkers() {
      if (!this.map || !this.markersLayer) return

      this.markersLayer.clearLayers()
      this.markersMap.clear()

      if (!this.items.length) return

      const bounds: Array<[number, number]> = []

      this.items.forEach((item) => {
        const marker = L.marker([item.lat, item.lng], {
          icon: this.createMarkerIcon(
            this.getMarkerColor(item.status),
            this.highlightedRequestId === item.id
          )
        })

        marker.bindPopup(`
          <div>
            <b>${item.title}</b><br/>
            ${item.objectName}<br/>
            ${item.fieldName}<br/>
            Приоритет: ${item.priority}<br/>
            Стоимость: ${new Intl.NumberFormat('ru-RU').format(item.cost)}
          </div>
        `)

        marker.on('click', () => {
          this.$store.dispatch('maintenanceRequest/selectRequest', item)
        })

        marker.on('mouseover', () => {
          this.$store.dispatch('maintenanceRequest/highlightRequest', item.id)
        })

        marker.on('mouseout', () => {
          this.$store.dispatch('maintenanceRequest/highlightRequest', null)
        })

        this.markersLayer?.addLayer(marker)
        this.markersMap.set(item.id, marker)
        bounds.push([item.lat, item.lng])
      })

      if (bounds.length === 1) {
        this.map.setView(bounds[0], 8)
      } else {
        this.map.fitBounds(bounds, { padding: [20, 20] })
      }
    }
  }
})
</script>

<style scoped>
.request-map {
  border-radius: 18px;
  height: 100%;
}

.request-map__header {
  margin-bottom: 12px;
}

.request-map__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.request-map__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.request-map__container,
.request-map__skeleton {
  height: 720px;
  border-radius: 12px;
  overflow: hidden;
}

.request-map__skeleton {
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: request-map-skeleton-loading 1.4s infinite;
}

@keyframes request-map-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
