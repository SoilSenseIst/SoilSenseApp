<script setup>
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
const days = ["Dia 1", "Dia 2", "Dia 3", "Dia 4", "Dia 5", "Dia 6", "Dia 7"];
const humidityData = [55, 60, 58, 62, 65, 63, 67];
const nitrogenData = [10, 12, 11, 13, 14, 15, 16];
const fosforoData = [5, 6, 6.5, 7, 7.2, 7.5, 7.8];
const potassioData = [8, 9, 8.5, 9.5, 10, 10.5, 11];

let chartInstance = null;

/* Lista de alertas com data (exemplo)*/
const alerts = ref([
  { date: "2025-05-17 08:00", message: "5 valores medidos na manhã." },
  { date: "2025-05-16 18:00", message: "Alerta: humidade baixa detectada." },
  { date: "2025-05-15 12:00", message: "Temperatura estável." },
]);

const alertsExpanded = ref(false);

const toggleAlerts = () => {
  alertsExpanded.value = !alertsExpanded.value;
};

onMounted(() => {
  firstName.value = localStorage.getItem("first_name") || "";
  lastName.value = localStorage.getItem("last_name") || "";
  deviceID.value = localStorage.getItem("device_ID") || "";

  temperature.value = 25; // exemplo
  humidity.value = 67;    // último valor do exemplo
  
  Nitrogenio.value = 16;
  Fosforo.value = 7.8;
  Potassio.value = 11;

  /* Inicializa gráfico após o DOM estar pronto */
  initChart();
});

/* Gráfico com as percentagens */
const initChart = () => {
  const ctx = document.getElementById('soilChart').getContext('2d');
  
  if(chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Humidity (%)',
          data: humidityData,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Nitrogen (%)',
          data: nitrogenData,
          borderColor: 'green',
          backgroundColor: 'rgba(0,128,0,0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Phosphor (%)',
          data: fosforoData,
          borderColor: 'orange',
          backgroundColor: 'rgba(255,165,0,0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Potassium (%)',
          data: potassioData,
          borderColor: 'red',
          backgroundColor: 'rgba(255,0,0,0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
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

</script>

<template>
  <main>
    <button @click="toggleSidebar">SoilSense</button>

    <h1>Hi, {{ firstName }} {{ lastName }}!</h1>

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

    <div style="margin-top: 5rem; max-width: 800px;">
      <canvas id="soilChart"></canvas>
    </div>

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
  </main>      
</template>

<style scoped>
main {
  padding: 1.5rem;
  position: relative;
}

h1 {
  margin-bottom: 1rem;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background-color: #eee;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
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
  background: transparent;
  z-index: 1200; 
}

.alerts-box {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 224, 0.95);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  font-weight: 600;
  font-size: 1rem;
  color: var( --pop);
  z-index: 1200;
  max-width: 320px;
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
  color: #553300;
}

/* Botão Ver mais / Ver menos */
.btn-toggle {
  margin-left: 0.75rem;
  background: none;
  border: none;
  color: #0056b3;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
  padding: 0;
}

.btn-toggle:hover {
  text-decoration: underline;
}

.device-box {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 2rem auto; /* centraliza */
  position: relative;
  z-index: 1;
}

.device-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Estilo dos ícones temperatura e humidade*/
.info-icons {
  position: relative;
  top: 1rem;
  display: flex;
  gap: 0.75rem;
  background: rgba(255,255,255,0.9);
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
  background: rgba(255,255,255,0.9);
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

</style>
