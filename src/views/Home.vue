<script setup>
import logo from './logo.png'; 

import { ref, onMounted } from "vue";
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

/* Dados fictícios para evolução nos últimos 7 dias */
const chartLabels = ref([]);
const chartHumidityData = ref([]);
const chartNitrogenData = ref([]);
const chartPhosphorusData = ref([]);
const chartPotassiumData = ref([]);

let chartInstance = null;

/* Lista de alertas com data (exemplo)*/
const alerts = ref([
  { date: "", message: "" },
]);

const alertsExpanded = ref(false);

const toggleAlerts = () => {
  alertsExpanded.value = !alertsExpanded.value;
};

onMounted(() => {
   firstName.value = localStorage.getItem("first_name") || "";
  lastName.value = localStorage.getItem("last_name") || "";
  deviceID.value = localStorage.getItem("device_ID") || "";

  refreshReadings(); 

  /* Inicializa gráfico após o DOM estar pronto */
  initChart();
});

/* Gráfico com as percentagens */
const initChart = () => {
  const ctx = document.getElementById('soilChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
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
          pointRadius: 4,
          pointBackgroundColor: 'blue',
          pointBorderColor: 'blue'
        },
        {
          label: 'Nitrogen (%)',
          data: chartNitrogenData.value,
          borderColor: 'green',
          backgroundColor: 'rgba(0,128,0,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 4,
          pointBackgroundColor: 'green',
          pointBorderColor: 'green'
        },
        {
          label: 'Phosphorus (%)',
          data: chartPhosphorusData.value,
          borderColor: 'orange',
          backgroundColor: 'rgba(255,165,0,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 4,
          pointBackgroundColor: 'orange',
          pointBorderColor: 'orange'
        },
        {
          label: 'Potassium (%)',
          data: chartPotassiumData.value,
          borderColor: 'red',
          backgroundColor: 'rgba(255,0,0,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 4,
          pointBackgroundColor: 'red',
          pointBorderColor: 'red'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,     // ← Usa ponto ao invés de retângulo
            pointStyle: 'circle',    // ← Define como círculo
            font: {
              size: 7 // 👈 Tamanho da fonte da legenda (pode ajustar mais)
            },
            padding: 30
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
          title: {
            display: true,
            text: 'Percentage (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Days'
          }
        }
      }
    }
  });
};


const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

const closeSidebar = () => {
  showSidebar.value = false;
};

const updateProfile = () => {
  router.push('/profile');
};

const logout = async () => {
  const sessionToken = localStorage.getItem('session_token');

  if (!sessionToken) {
      alert("No session token found.");
      return;
  }

  const res = await fetch("https://soilsenseserver.onrender.com/logout", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          session_token: sessionToken
      })
  }).then(res => res.json());

  if (res.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('session_token');
      router.push('/login');
  } else {
      alert(res.message);
  }
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

      // Alimentar os dados do gráfico
      const recent = data.data.slice(-14); 

      chartLabels.value = recent.map((entry, i) => `Day ${i + 1}`);
      chartHumidityData.value = recent.map(entry => entry.humidity);
      chartNitrogenData.value = recent.map(entry => entry.nitrogen);
      chartPhosphorusData.value = recent.map(entry => entry.phosphorus);
      chartPotassiumData.value = recent.map(entry => entry.potassium);

      initChart(); // reinicializa o gráfico com novos dados
    } else {
      console.warn("⚠️ Nenhum dado retornado da API");
    }
  } catch (error) {
    console.error("❌ Erro ao atualizar valores:", error);
  }
};



</script>

<template>
  <main>
    <img :src="logo" alt="SoilSense Logo" class="logo-img" @click="toggleSidebar" style="cursor:pointer;" />

    <h1>Hi, {{ firstName }} {{ lastName }}!</h1>

  <div class="device-box">
    <h2 class="device-title"> Device: {{ deviceID }}</h2>


    <div class="info-icons">
      <div class="icon-temp" title="Temperature">
        🌡️ {{ temperature }}°C
      </div>
      <div class="icon-humidity" title="Humidity">
        💧 {{ humidity }}%
      </div>
    </div>

    <div class="nutri-icons">
      <div class="icon-N" title="Nitrogen">
        N {{ Nitrogenio }} %
      </div>
      <div class="icon-P" title="Phosphor">
        P {{ Fosforo }}%
      </div>
      <div class="icon-K" title="Potassium">
        K {{ Potassio }}%
      </div>
    </div>

      <div style="margin-top: 5rem; width: 100%; display: flex; justify-content: center;">
        <canvas id="soilChart" style="max-width: 100%; height: auto; min-height: 300px;"></canvas>
      </div>

          <div class="alerts-box" title="Alertas">
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

    <div 
        v-if="alertsExpanded" 
        class="alerts-overlay" 
        @click="alertsExpanded = false"
    ></div>

  </div>

    <div 
      v-if="showSidebar" 
      class="overlay" 
      @click="closeSidebar"
    ></div>

    <div v-if="showSidebar" class="sidebar" @click.stop>
      <button @click="logout">Logout</button>
      <button @click="updateProfile">Update Profile</button>
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

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  z-index: 1200;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.3);
  z-index: 1000;
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
  z-index: 1100; /* acima da sidebar */
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
  z-index: 1100; /* acima da sidebar */
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

</style>
