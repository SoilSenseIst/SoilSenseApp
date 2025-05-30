<script setup>
import logo from './logo.png'; 
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
const router = useRouter();

const firstName = ref("");
const lastName = ref("");
const deviceID = ref("");
const showSidebar = ref(false);

const temperature = ref(""); 
const humidity = ref("");     
const Nitrogenio = ref("");  
const Fosforo = ref("");     
const Potassio = ref("");

// Dados para os gráficos
const chartLabels = ref([]);
const chartHumidityData = ref([]);
const chartTemperatureData = ref([]);
const chartNitrogenData = ref([]);
const chartPhosphorusData = ref([]);
const chartPotassiumData = ref([]);

let nutrientChart = null;
let climateChart = null;

// Edição do device
const editMode = ref(false); 
const irrigationCount = ref(1);
const nutrients = ref([
  Array.from({ length: 6 }, (_, i) => ({
    name: ["Water", "HaifaMap", "HaifaMKP", "HakaphosVioleta", "Calcinit", "Summun"][i],
    value: 0,
  }))
]);
watch(irrigationCount, (newCount) => {
  nutrients.value = Array.from({ length: newCount }, () =>
    ["Water", "HaifaMap", "HaifaMKP", "HakaphosVioleta", "Calcinit", "Summun"].map(name => ({
      name,
      value: 0
    }))
  );
  updateIrrigationChart();
});
const toggleEdit = () => {
  editMode.value = !editMode.value;
  updateIrrigationChart();
};

// Alertas
const alerts = ref([{ date: "", message: "" }]);
const alertsExpanded = ref(false);
const toggleAlerts = () => alertsExpanded.value = !alertsExpanded.value;

// Update profile 
const updateProfile = () => router.push('/profile');

// Data
const fetchUserData = async () => {
  try {
    const username = localStorage.getItem("user") || "";
    if (!username) return;

    const res = await fetch(`https://sua-api.com/api/users?username=${username}`);
    const data = await res.json();

    if (data.success && data.user) {
      //firstName.value = data.user.first_name || "";
      //lastName.value = data.user.last_name || "";

      /* Suporte a múltiplos deviceIDs
      if (Array.isArray(data.user.deviceIDs)) {
        devices.value = data.user.deviceIDs.map(id => ({ id }));
      } else if (data.user.deviceID) {
        devices.value = [{ id: data.user.deviceID }];
      }*/
    }
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
  }
};
onMounted(async () => {
  await fetchUserData();
  await refreshReadings();
});

// Gráficos
const initReadingsCharts = () => {
  const destroyChart = chart => chart && chart.destroy();

  destroyChart(nutrientChart);
  destroyChart(climateChart);

  // Gráfico 1: Nutrientes
  nutrientChart = new Chart(document.getElementById('nutrientChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: chartLabels.value,
      datasets: [
        {
          label: 'Nitrogen (%)',
          data: chartNitrogenData.value,
          borderColor: 'green',
          backgroundColor: 'rgba(0,128,0,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 1.5,
          pointBackgroundColor: 'green',
          pointBorderColor: 'green',
          borderWidth: 1
        },
        {
          label: 'Phosphorus (%)',
          data: chartPhosphorusData.value,
          borderColor: 'orange',
          backgroundColor: 'rgba(255,165,0,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 1.5,
          pointBackgroundColor: 'orange',
          pointBorderColor: 'orange',
          borderWidth: 1
        },
        {
          label: 'Potassium (%)',
          data: chartPotassiumData.value,
          borderColor: 'red',
          backgroundColor: 'rgba(255,0,0,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 1.5,
          pointBackgroundColor: 'red',
          pointBorderColor: 'red',
          borderWidth: 1
        }
      ]
    },
  options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,    
            pointStyle: 'circle',
            font: {
              size: 10
            },
            padding: 10
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      scales: {
        y: {
          min: 0,
          max: 100,
        },
        x: {
          title: {
            display: true,
            text: 'NPK readings'
          }
        }
      }
    }
  });

  // Gráfico 2: Temperatura e Humidade
  climateChart = new Chart(document.getElementById('climateChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: chartLabels.value,
      datasets: [
        {
          label: 'Humidity (%)',
          data: chartHumidityData.value,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 1.5,
          pointBackgroundColor: 'rgba(0,0,255,1)',
          pointBorderColor: 'blue',
          borderWidth: 1
        },
        {
          label: 'Temperature (°C)',
          data: chartTemperatureData.value,
          borderColor: 'red',
          backgroundColor:  'rgba(255,0,0,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 1.5,
          pointBackgroundColor: 'rgba(255,0,0,1)',
          pointBorderColor: 'red',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,    
            pointStyle: 'circle',
            font: {
              size: 10
            },
            padding: 10
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      scales: {
        y: {
          min: 0,
          max: 100,
        },
        x: {
          title: {
            display: true,
            text: 'Atmospheric readings '
          }
        }
      }
    }
  });
};
const refreshReadings = async () => {
  try {
    const res = await fetch("https://soilsense-api.onrender.com/api/readings");
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      const latest = data.data[data.data.length - 1];
      temperature.value = latest.temperature;
      humidity.value = latest.humidity;
      Nitrogenio.value = latest.nitrogen;
      Fosforo.value = latest.phosphorus;
      Potassio.value = latest.potassium;

      const recent = data.data.slice(-14);
      chartLabels.value = recent.map((_, i) => `${i + 1}`);
      chartHumidityData.value = recent.map(entry => entry.humidity);
      chartTemperatureData.value = recent.map(entry => entry.temperature);
      chartNitrogenData.value = recent.map(entry => entry.nitrogen);
      chartPhosphorusData.value = recent.map(entry => entry.phosphorus);
      chartPotassiumData.value = recent.map(entry => entry.potassium);

      initReadingsCharts();
    }
  } catch (error) {
    console.error("Erro ao atualizar valores:", error);
  }
};

// Logout
const logout = async () => {
  const sessionToken = localStorage.getItem('session_token');
  if (!sessionToken) return alert("No session token found.");

  const res = await fetch("https://soilsenseserver.onrender.com/logout", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_token: sessionToken })
  }).then(res => res.json());

  if (res.success) {
    localStorage.removeItem('token');
    localStorage.removeItem('session_token');
    router.push('/login');
  } else {
    alert(res.message);
  }
};

</script>

<template>
  <main>

    <img :src="logo" alt="SoilSense Logo" class="logo-img" />
    <div class="profile-circle" @click="updateProfile">🧑‍🌾 </div>
    <div class="add-device-circle" @click="addDevice">➕ </div>

    <h1>Hi, {{ firstName }} {{ lastName }}!</h1>

    <div class="device-box">
      
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 class="device-title">Device: {{ deviceID }}</h2>
        <button class="edit-button" @click="toggleEdit">✏️</button>
      </div>
      
      <template v-if="!editMode">

        <div class="info-icons">
          <div class="icon-temp">🌡️ {{ temperature }}°C</div>
          <div class="icon-humidity">💧 {{ humidity }}%</div>
        </div>
        <div class="nutri-icons">
          <div class="icon-N">N {{ Nitrogenio }}%</div>
          <div class="icon-P">P {{ Fosforo }}%</div>
          <div class="icon-K">K {{ Potassio }}%</div>
        </div>
        <div class="charts-container">
          <canvas id="nutrientChart"></canvas>
          <canvas id="climateChart"></canvas>
          <canvas id="irrigationChart"></canvas>
        </div>
        <div class="alerts-box">
          <button class="btn-toggle" @click.stop="toggleAlerts">
            {{ alertsExpanded ? 'Ver menos' : 'Messages' }}
          </button>
          <div v-if="alertsExpanded" class="messages">
            <ul class="alerts-list">
              <li v-for="(alert, index) in alerts" :key="index">
                <strong>{{ alert.date }}:</strong> {{ alert.message }}
              </li>
            </ul>
          </div>
        </div>

      </template>

      <template v-else>

        <div class="edit-irrigation-form">
          <label class="irrigation-block">
            How many times do you want to irrigate:
            <input type="number" min="1" v-model.number="irrigationCount" />
          </label>
          <div v-for="(set, i) in nutrients" :key="i" class="irrigation-block">
            <h4>Irrigation {{ i + 1 }}</h4>
            <div class="nutrient-inputs">
              <label v-for="(nutrient, j) in set" :key="j">
                {{ nutrient.name }} ({{ j === 0 ? 'L' : 'Kg' }}):
                <input type="number" min="0" max="100" v-model.number="nutrients[i][j].value" />
              </label>
            </div>
          </div>
        </div>
        
      </template>
    </div>

    <div class="logout-box">
      <input type="submit" value="logout" @click="logout" />
    </div>
  </main>
</template>

<style scoped>
main {
  background-color: var(--primary-dark);
  padding: 2rem;
  position: relative;
}

h1{
    font: 2rem;
    margin-top: 2rem;
    color:white;
}

.alerts-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100; 
}

.alerts-box {
  position: relative;
  bottom: 1rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: none;
  font-weight: 600;
  font-size: 1rem;
  color: var( --pop);
  z-index: 100;
  width: 100%;
  cursor: default;
  user-select: none;
}

/* Lista de alertas */
.alerts-list {
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  padding-left: 1rem;
  list-style-type: disc;
  font-weight: normal;
  font-size: 0.9rem;
  color: var(--dark);
}

/* Botão Ver mais / Ver menos */
.btn-toggle {
  margin-left: 0.75rem;
  background: none;
  border: none;
  color: var(--dark);
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
  padding: 0;
}

.btn-toggle:hover {
  text-decoration: underline;
}

.device-box{
    flex: 1 1 0%;
    display: block;
    border-radius: 1.5rem 1.5rem 1.5rem 1.5rem;
    background-color: white;
    box-shadow: 0px -4px 12px 4px rgba(0,0,0,0.16);
    color: var(--dark);
    padding: 2rem 1.5rem;
    margin-top: 2rem;
    width: 100%;
}


.device-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Estilo dos ícones temperatura e humidade*/
.info-icons {
  position: relative;
  top: 1rem;
  display: flex;
  gap: 0.75rem;
  background:white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0,0,0,0.1);
  z-index: 100; /* acima da sidebar */
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.icon-temp, .icon-humidity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: default;
}

/* Estilo dos ícones dos fertilizantes*/
.nutri-icons {
  position: relative;
  top: 2rem;
  display: flex;
  gap: 0.75rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0,0,0,0.1);
  z-index: 100; /* acima da sidebar */
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.icon-N, .icon-P, .icon-K  {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: default;
}

.edit-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--dark);
  transition: transform 0.2s;
}

.edit-button:hover {
  transform: scale(1.1);
}

.edit-irrigation-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.edit-irrigation-form label {
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dark);
}

.edit-irrigation-form input {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.nutrient-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.irrigation-block {
  display: block;
    color: var(--blue);
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 2rem;
    padding: 1rem;
    border-radius: 1.5rem 1.5rem 1.5rem 1.5rem;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.irrigation-block h4 {
  margin-bottom: 1rem;
  color: var(--dark);
}

.logout-box {
  display: block;
  width: fit-content;
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.logout-box input[type="submit"] {
  font-size: 1.5rem;
  font-weight: 200;
  color: #F3F4F6;
  background-color: var(--primary-dark);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: 0.2s ease;
  border: none;
}

.logout-box input[type="submit"]:hover {
  background-color: var(--primary);
}

.profile-circle {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.3s;
}

.profile-circle:hover {
  background-color: #f0f0f0;
}

.add-device-circle {
  position: absolute;
  top: 2rem;
  right: 5.5rem;
  width: 48px;
  height: 48px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1000;
  transition: background-color 0.3s;
}

.add-device:hover {
  background-color: #f0f0f0;
}


.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 4rem;
  justify-content: center;
}

.charts-container canvas {
  width: 300px !important;
  height: 250px !important;
}

</style>
