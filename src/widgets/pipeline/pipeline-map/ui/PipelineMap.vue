<template>
  <el-card shadow="never" class="pipeline-map">
    <div class="pipeline-map__header">
      <div>
        <h3 class="pipeline-map__title">Карта участков трубопровода</h3>
        <p class="pipeline-map__subtitle">География сети и синхронизация с таблицей</p>
      </div>
    </div>

    <div ref="mapRoot" class="pipeline-map__container"></div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { PipelineSection } from '@/entities/pipeline/model/pipeline.types'

export default Vue.extend({
  name: 'PipelineMap',

  data() {
    return {
      map: null as L.Map | null,
      markersLayer: null as L.MarkerClusterGroup | null,
      markersMap: new Map<number, L.Marker>()
    }
  },

  computed: {
    items(): PipelineSection[] {
      return this.$store.getters['pipeline/filteredItems']
    },

    highlightedPipelineId(): number | null {
      return this.$store.state.pipeline.highlightedPipelineId
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

    highlightedPipelineId() {
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

    getMarkerColor(status: PipelineSection['status']): string {
      if (status === 'operational') return '#67C23A'
      if (status === 'inspection') return '#409EFF'
      if (status === 'repair') return '#E6A23C'
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
        const item = this.items.find((pipeline) => pipeline.id === id)
        if (!item) return

        marker.setIcon(
          this.createMarkerIcon(this.getMarkerColor(item.status), this.highlightedPipelineId === id)
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
            this.highlightedPipelineId === item.id
          )
        })

        marker.bindPopup(`
            <div>
              <b>${item.sectionName}</b><br/>
              ${item.region}<br/>
              Длина: ${item.lengthKm} км<br/>
              Давление: ${item.pressure}<br/>
              Инциденты: ${item.incidentsCount}
            </div>
          `)

        marker.on('click', () => {
          this.$store.dispatch('pipeline/selectPipeline', item)
        })

        marker.on('mouseover', () => {
          this.$store.dispatch('pipeline/highlightPipeline', item.id)
        })

        marker.on('mouseout', () => {
          this.$store.dispatch('pipeline/highlightPipeline', null)
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
.pipeline-map {
  border-radius: 18px;
  height: 100%;
}

.pipeline-map__header {
  margin-bottom: 12px;
}

.pipeline-map__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.pipeline-map__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.pipeline-map__container {
  height: 460px;
  border-radius: 12px;
  overflow: hidden;
}
</style>
