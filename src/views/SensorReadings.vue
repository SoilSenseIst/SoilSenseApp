<template>
  <div class="readings">
    <h2>Últimas Leituras do Sensor</h2>
    <ul v-if="readings.length">
      <li v-for="reading in readings" :key="reading.id">
        🌡 Temp: {{ reading.temperature }}°C |
        💧 Umidade: {{ reading.humidity }}% |
        🌱 N: {{ reading.nitrogen }} |
        P: {{ reading.phosphorus }} |
        K: {{ reading.potassium }} |
        🕒 {{ formatDate(reading.created_at) }}
      </li>
    </ul>
    <p v-else>Carregando dados...</p>
  </div>
</template>

<script>
export default {
  name: "SensorReadings",
  data() {
    return {
      readings: [],
    };
  },
  mounted() {
    fetch("https://soilsense-api.onrender.com/api/readings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          this.readings = data.data;
        } else {
          console.error("Erro na API:", data.error);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
      });
  },
  methods: {
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString("pt-PT");
    },
  },
};
</script>

<style scoped>
.readings {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.readings li {
  margin: 8px 0;
}
</style>
