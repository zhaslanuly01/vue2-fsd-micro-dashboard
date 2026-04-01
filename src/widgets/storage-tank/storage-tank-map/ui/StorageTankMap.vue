<template>
  <el-card shadow="never" class="tank-map">
    <div class="tank-map__header">
      <div>
        <h3 class="tank-map__title">Карта резервуаров</h3>
        <p class="tank-map__subtitle">Терминалы, статусы и текущая загрузка</p>
      </div>
    </div>

    <div ref="mapRoot" class="tank-map__container"></div>
  </el-card>
</template>

<script lang="ts">
import Vue from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { StorageTank } from '@/entities/storage-tank/model/storage-tank.types'

export default Vue.extend({
  name: 'StorageTankMap',

  data() {
    return {
      map: null as L.Map | null,
      markersLayer: null as L.MarkerClusterGroup | null,
      markersMap: new Map<number, L.Marker>()
    }
  },

  computed: {
    items(): StorageTank[] {
      return this.$store.getters['storageTank/filteredItems']
    },

    highlightedTankId(): number | null {
      return this.$store.state.storageTank.highlightedTankId
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

    highlightedTankId() {
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

    getMarkerColor(status: StorageTank['status']): string {
      if (status === 'normal') return '#67C23A'
      if (status === 'high_load') return '#F56C6C'
      if (status === 'maintenance') return '#E6A23C'
      return '#909399'
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
        const tank = this.items.find((item) => item.id === id)
        if (!tank) return

        const color = this.getMarkerColor(tank.status)
        const isHighlighted = this.highlightedTankId === id

        marker.setIcon(this.createMarkerIcon(color, isHighlighted))
      })
    },

    renderMarkers() {
      if (!this.map || !this.markersLayer) return

      this.markersLayer.clearLayers()
      this.markersMap.clear()

      if (!this.items.length) return

      const bounds: Array<[number, number]> = []

      this.items.forEach((tank) => {
        const color = this.getMarkerColor(tank.status)
        const isHighlighted = this.highlightedTankId === tank.id

        const marker = L.marker([tank.lat, tank.lng], {
          icon: this.createMarkerIcon(color, isHighlighted)
        })

        marker.bindPopup(`
            <div>
              <b>${tank.tankNumber}</b><br/>
              ${tank.terminalName}<br/>
              ${tank.region}<br/>
              Тип: ${tank.productType}<br/>
              Заполненность: ${tank.fillPercent}%<br/>
              Объем: ${tank.currentVolume} / ${tank.capacity}
            </div>
          `)

        marker.on('click', () => {
          this.$store.dispatch('storageTank/selectTank', tank)
        })

        marker.on('mouseover', () => {
          this.$store.dispatch('storageTank/highlightTank', tank.id)
        })

        marker.on('mouseout', () => {
          this.$store.dispatch('storageTank/highlightTank', null)
        })

        this.markersLayer?.addLayer(marker)
        this.markersMap.set(tank.id, marker)
        bounds.push([tank.lat, tank.lng])
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
.tank-map {
  border-radius: 18px;
  height: 100%;
}

.tank-map__header {
  margin-bottom: 12px;
}

.tank-map__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.tank-map__subtitle {
  margin: 6px 0 0;
  color: var(--label-secondary);
  font-size: 13px;
}

.tank-map__container {
  height: 720px;
  border-radius: 12px;
  overflow: hidden;
}
</style>
