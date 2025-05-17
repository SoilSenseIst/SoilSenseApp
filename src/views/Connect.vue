<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";


const router = useRouter();

const device_ID = ref("");
const device_key = ref("");
const progress = ref(0);
const statusMessage = ref("Connecting...");

onMounted(() => {
  device_ID.value = localStorage.getItem("device_ID") || "";
  device_key.value = localStorage.getItem("device_key") || "";

  simulateConnection();
});

// Simula uma tentativa de conexão com ESP32
function simulateConnection() {
  const interval = setInterval(() => {
    if (progress.value < 95) {
      progress.value += Math.random() * 5;
    }
  }, 200);

  // Simula a resposta da conexão após um tempo
  setTimeout(() => {
    clearInterval(interval);
    progress.value = 100;
    statusMessage.value = "Connection established successfully!";
    router.push("/");
  }, 4000);
}
</script>

<template>
  <div class="container">
    <h2>Connecting to {{ device_ID }}...</h2>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
    <p>{{ statusMessage }}</p>
  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
  font-family: var(--font-family);
}

.progress-bar {
  width: 100%;
  height: 25px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin: 20px 0;
  box-shadow: inset 0 0 5px #ccc;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary);
  transition: width 0.3s ease;
}
</style>