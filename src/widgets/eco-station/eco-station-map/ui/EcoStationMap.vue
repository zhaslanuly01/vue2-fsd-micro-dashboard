<template>
  <el-card shadow="never" class="eco-map">
    <div class="eco-map__header">
      <div>
        <h3 class="eco-map__title">Карта экологических станций</h3>
        <p class="eco-map__subtitle">Точки мониторинга по месторождениям и регионам</p>
      </div>
    </div>

    <div ref="mapRoot" class="eco-map__container"></div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { EcoStation } from '@/entities/eco-station/model/eco-station.types'

export default Vue.extend({
  name: 'EcoStationMap',

  data() {
    return {
      map: null as L.Map | null,
      markersLayer: null as L.MarkerClusterGroup | null,
      markersMap: new Map<number, L.Marker>()
    }
  },

  computed: {
    items(): EcoStation[] {
      return this.$store.getters['ecoStation/filteredItems']
    },

    highlightedStationId(): number | null {
      return this.$store.state.ecoStation.highlightedStationId
    }
  },

  mounted() {
    this.initMap()
    this.renderMarkers()
  },

  beforeDestroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  },

  watch: {
    items: {
      handler() {
        this.renderMarkers()
      },
      deep: true
    },

    highlightedStationId() {
      this.updateHighlight()
    }
  },

  methods: {
    initMap() {
      const root = this.$refs.mapRoot as HTMLDivElement | undefined
      if (!root) return

      this.map = L.map(root).setView([47.5, 54.5], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map)

      this.markersLayer = L.markerClusterGroup()
      this.map.addLayer(this.markersLayer)
    },

    getMarkerColor(status: EcoStation['status']): string {
      if (status === 'normal') return '#67C23A'
      if (status === 'attention') return '#E6A23C'
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
        const item = this.items.find((station) => station.id === id)
        if (!item) return

        marker.setIcon(
          this.createMarkerIcon(this.getMarkerColor(item.status), this.highlightedStationId === id)
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
            this.highlightedStationId === item.id
          )
        })

        marker.bindPopup(`
            <div>
              <b>${item.stationName}</b><br/>
              ${item.fieldName}<br/>
              ${item.region}<br/>
              Выбросы: ${item.emissionLevel}<br/>
              CO₂: ${item.co2Level}<br/>
              H₂S: ${item.h2sLevel}
            </div>
          `)

        marker.on('click', () => {
          this.$store.dispatch('ecoStation/selectStation', item)
        })

        marker.on('mouseover', () => {
          this.$store.dispatch('ecoStation/highlightStation', item.id)
        })

        marker.on('mouseout', () => {
          this.$store.dispatch('ecoStation/highlightStation', null)
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
.eco-map {
  border-radius: 18px;
  height: 100%;
}

.eco-map__header {
  margin-bottom: 12px;
}

.eco-map__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.eco-map__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.eco-map__container {
  height: 460px;
  border-radius: 12px;
  overflow: hidden;
}
</style>
