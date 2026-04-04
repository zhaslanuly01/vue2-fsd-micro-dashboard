<template>
  <el-card shadow="never" class="well-map">
    <div class="well-map__header">
      <div>
        <h3 class="well-map__title">Карта скважин</h3>
        <p class="well-map__subtitle">Кластеризация и синхронизация с таблицей</p>
      </div>
    </div>

    <div v-if="loading" class="well-map__skeleton" />
    <div v-else ref="mapRoot" class="well-map__container"></div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { Well } from '@/entities/well/model/well.types'

export default Vue.extend({
  name: 'WellMap',

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
    items(): Well[] {
      return this.$store.getters['well/filteredItems']
    },

    highlightedWellId(): number | null {
      return this.$store.state.well.highlightedWellId
    }
  },

  mounted() {
    window.addEventListener('resize', this.handleResize)

    if (!this.loading) {
      this.$nextTick(() => {
        this.initMap()
        this.renderMarkers()
      })
    }
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)

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
          this.markersLayer = null
          this.markersMap.clear()
        }
        return
      }

      this.$nextTick(() => {
        this.initMap()
        this.renderMarkers()
        this.invalidateMapSize()
      })
    },

    items: {
      handler() {
        if (this.loading) return

        this.$nextTick(() => {
          this.renderMarkers()
          this.invalidateMapSize()
        })
      },
      deep: true
    },

    highlightedWellId() {
      if (this.loading) return
      this.updateHighlight()
    }
  },

  methods: {
    handleResize() {
      this.invalidateMapSize()
    },

    invalidateMapSize() {
      if (!this.map) return

      this.$nextTick(() => {
        setTimeout(() => {
          this.map && this.map.invalidateSize()
        }, 50)
      })
    },

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

      this.invalidateMapSize()
    },

    getMarkerColor(status: Well['status']): string {
      if (status === 'active') return '#67C23A'
      if (status === 'inactive') return '#909399'
      if (status === 'maintenance') return '#E6A23C'
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
        const well = this.items.find((w) => w.id === id)
        if (!well) return

        const color = this.getMarkerColor(well.status)
        const isHighlighted = this.highlightedWellId === id

        marker.setIcon(this.createMarkerIcon(color, isHighlighted))
      })
    },

    renderMarkers() {
      if (!this.map || !this.markersLayer) return

      this.markersLayer.clearLayers()
      this.markersMap.clear()

      if (!this.items.length) {
        this.invalidateMapSize()
        return
      }

      const bounds: Array<[number, number]> = []

      this.items.forEach((well) => {
        const color = this.getMarkerColor(well.status)
        const isHighlighted = this.highlightedWellId === well.id

        const marker = L.marker([well.lat, well.lng], {
          icon: this.createMarkerIcon(color, isHighlighted)
        })

        this.markersMap.set(well.id, marker)

        marker.bindPopup(`
          <div>
            <b>${well.wellNumber}</b><br/>
            ${well.name}<br/>
            ${well.fieldName}<br/>
            Дебит: ${well.oilRate}<br/>
            Давление: ${well.pressure}
          </div>
        `)

        marker.on('click', () => {
          this.$store.dispatch('well/selectWell', well)
        })

        marker.on('mouseover', () => {
          this.$store.dispatch('well/highlightWell', well.id)
        })

        marker.on('mouseout', () => {
          this.$store.dispatch('well/highlightWell', null)
        })

        this.markersLayer?.addLayer(marker)
        bounds.push([well.lat, well.lng])
      })

      this.$nextTick(() => {
        this.invalidateMapSize()

        if (!this.map) return

        if (bounds.length === 1) {
          this.map.setView(bounds[0], 8)
        } else {
          this.map.fitBounds(bounds, { padding: [20, 20] })
        }
      })
    }
  }
})
</script>

<style scoped>
.well-map {
  border-radius: 16px;
  height: 100%;
}

.well-map__header {
  margin-bottom: 12px;
}

.well-map__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.well-map__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.well-map__container,
.well-map__skeleton {
  height: 380px;
  border-radius: 12px;
  overflow: hidden;
}

.well-map__skeleton {
  background: linear-gradient(90deg, #f2f3f5 25%, #e9ecef 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: well-map-skeleton-loading 1.4s infinite;
}

@keyframes well-map-skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 991px) {
  .well-map__container,
  .well-map__skeleton {
    height: 420px;
  }
}

@media (max-width: 575px) {
  .well-map__title {
    font-size: 16px;
  }

  .well-map__subtitle {
    font-size: 12px;
  }

  .well-map__container,
  .well-map__skeleton {
    height: 340px;
  }
}
</style>
