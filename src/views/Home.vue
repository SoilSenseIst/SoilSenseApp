<script setup>
import logo from './logo.png'; 
import plus from './plus.png'; 
import question from './question.png'; 
import lapis from './lapis.png'; 
import alarme from './alarme.png';  
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Chart, registerables } from 'chart.js'; 
import { nextTick } from "vue";


Chart.register(...registerables);

const router = useRouter();
const route = useRoute();

const firstName = ref("");
const lastName = ref("");
const deviceID = ref("");
const device_key = ref("");

const showSidebar = ref(false);

const devices = ref([]);
const readings = ref({}); // 🔥 readings por device_id separado!
const alerts = ref([]);



const temperature = ref(""); 
const humidity = ref("");     
const Nitrogenio = ref("");  
const Fosforo = ref("");     
const Potassio = ref("");

const chartLabels = ref([]);
const chartTemperatureData = ref([]);
const chartHumidityData = ref([]);
const chartNitrogenData = ref([]);
const chartPhosphorusData = ref([]);
const chartPotassiumData = ref([]);

/* Dados para os gráficos de irrigação - água e 5 depositos*/
const chartIrrigationData = ref([]);
const chartWaterData = ref([]);
const chart1Data = ref([]);
const chart2Data = ref([]);
const chart3Data = ref([]);
const chart4Data = ref([]);
const chart5Data = ref([]);


let chartInstance = null;
let chartInstance1 = null;
let chartInstance2 = null; //Gráfico de irrigação

///////////////////////////////////////////////////////////////////////////////
const Funcionalities = () => {
  router.push('/funcionalities');
};
const addDevice = async () => {
  const email = localStorage.getItem("email") || "";
  if (!email) return;
  const newDeviceId = prompt("Enter new device ID:");
  if (!newDeviceId) return;

  try {
    const res = await fetch(`https://soilsense-api.onrender.com/api/add-device`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, device_ID: newDeviceId })
    });

    const data = await res.json();
    if (data.success) {
     
         // Remove duplicados antes de salvar no localStorage
const updatedDevices = Array.from(new Set([...devices.value, newDeviceId]));
devices.value = updatedDevices;

localStorage.setItem("devices", JSON.stringify(devices.value));
localStorage.setItem("selected_device_ID", newDeviceId);
deviceID.value = newDeviceId;
await fetchProfileForDevice();

      //await fetchReadingsForDevice(newDeviceId);~
      //await fetchLatestDevice(); // Atualiza a lista de devices
      await refreshReadings(); // 👍 chama o refreshReadings normal

    } else {
      console.warn("Erro ao adicionar device:", data.message);
    }
  } catch (err) {
    console.error("Erro ao adicionar device:", err);
  }
};

///////////////////////////////////////////////////////////////////////////////
/* Lista de alertas */
const fetchAlerts = async () => {
  if (!deviceID.value) return;
  try {
const res = await fetch(`https://soilsense-api.onrender.com/api/alerts?device_id=${deviceID.value}`);
    const data = await res.json();

  console.log("API ALERTS RESPONSE:", data);

    if (data.success) {
      alerts.value = data.alerts.map(a => ({
        date: new Date(a.created_at).toLocaleString(),
        message: a.message
      }));
    }
  } catch (err) {
    console.error("Erro ao buscar alertas:", err);
  }
};

//////////////////////////////////////////////////////////////////////////////
// modo edição
const editMode = ref(false); 
const irrigationCount = ref(1);
const nutrients = ref([
  Array.from({ length: 6 }, (_, i) => ({
    name: ["Water", "Dispenser 1", "Dispenser 2", "Dispenser 3", "Dispenser 4", "Dispenser 5"][i],
    value: 0,
  }))
]);
watch(irrigationCount, (newCount) => {
  nutrients.value = Array.from({ length: newCount }, () =>
    ["Water", "Dispenser 1", "Dispenser 2", "Dispenser 3", "Dispenser 4", "Dispenser 5"].map(name => ({
      name,
      value: 0
    }))
  );
  updateIrrigationChart();
});
const toggleEdit = () => {
  editMode.value = !editMode.value;
  refreshReadings();
  if (!editMode.value) {
    nextTick(() => {
      initChart();
    });
  }
  if (alarmMode.value) {
    alarmMode.value = false; // Desativa o modo alarme ao entrar no modo edição
  }
};
//////////////////////////////////////////////////////////////////////////////
// modo alarme
const alarmMode = ref(false); 
const toggleAlarm = () => {
  alarmMode.value = !alarmMode.value;
  refreshReadings();

  if (alarmMode.value) {
    fetchAlerts();
  } else {
    nextTick(() => {
      initChart();
    });
  }
  if (editMode.value) {
    editMode.value = false; // Desativa o modo alarme ao entrar no modo edição
  }
};

/////////////////////////////////////////////////////
const fetchLatestDevice = async () => {
  try {
    const email = localStorage.getItem("email") || "";
    if (!email) return;

    const res = await fetch(`https://soilsense-api.onrender.com/api/user-profile?email=${email}`);
    const data = await res.json();

    if (data.success && data.profiles) {
      // Atualiza a lista de devices
      devices.value = data.profiles.map(p => p.device_id);

      // Se deviceID ainda não está definido, define como o primeiro da lista
     /* if (!deviceID.value && devices.value.length > 0) {
        deviceID.value = devices.value[0];
      }*/
    } else {
      console.warn("Nenhum profile encontrado.");
      devices.value = []; // limpa devices caso não tenha nenhum

    }
  } catch (error) {
    console.error("Erro ao buscar devices do perfil:", error);
  }
};
///////////////////////////////////////////////////////////
const fetchProfileForDevice = async () => {
  try {
    const email = localStorage.getItem("email") || "";
    if (!email || !deviceID.value) return;

    const res = await fetch(`https://soilsense-api.onrender.com/api/user-profile-by-device?email=${email}&device_id=${deviceID.value}`);
    const data = await res.json();

    if (data.success && data.profile) {
      firstName.value = data.profile.first_name || "";
      lastName.value = data.profile.last_name || "";
      localStorage.setItem("first_name", firstName.value);
      localStorage.setItem("last_name", lastName.value);

      console.log("✅ Fetched profile for device:", deviceID.value, "->", firstName.value, lastName.value);
    } else {
      console.warn("⚠️ Profile não encontrado para device:", deviceID.value);
      firstName.value = "";
      lastName.value = "";
    }
  } catch (error) {
    console.error("❌ Erro ao buscar perfil do device:", error);
  }
};

///////////////////////////////////////////////////////////////////////////////
watch(
  () => route.fullPath,
  async (newPath) => {
    if (newPath === '/home') {
      console.log("🔄 Voltou para Home, atualizando devices...");
      await fetchLatestDevice();
      for (const device of devices.value) {
        //await fetchReadingsForDevice(device);
       await refreshReadings(deviceID.value); // passa o deviceID atual

      }
    }
  }
);

watch(deviceID, async (newVal) => {
  if (newVal) {
    console.log("📡 deviceID mudou → atualizando tudo:", newVal);
    await fetchAlerts();
    await refreshReadings(newVal); // usando o deviceID certo no readings também
    await fetchProfileForDevice(); // atualiza Hi FirstName LastName corretamente
  }
});


///////////////////////////////////////////////////////////////////////////////////
onMounted(() => {
  firstName.value = localStorage.getItem("first_name") || "";
  lastName.value = localStorage.getItem("last_name") || "";
 // deviceID.value = localStorage.getItem("device_ID") || "";
  const savedDevices = JSON.parse(localStorage.getItem("devices")) || [];
  devices.value = savedDevices;
  deviceID.value = localStorage.getItem("selected_device_ID") || "";

  fetchProfileForDevice(); // ✅ chama aqui SEM DEPENDER do watch!
  refreshReadings1(); // Atualiza os dados de irrigação

  refreshReadings(); 

  /* Inicializa gráfico após o DOM estar pronto */
  initChart();
});

///////////////////////////////////////////////////////////////////////////////
/* Gráfico com as percentagens */
const initChart = () => {
  const ctx1 = document.getElementById('soilChart').getContext('2d');
  const ctx2 = document.getElementById('soilChart2').getContext('2d');
  const ctx3 = document.getElementById('soilChart3').getContext('2d');

  // Destroy existing instances if they exist
  if (chartInstance) {
    chartInstance.destroy();
  }
  if (chartInstance1) {
    chartInstance1.destroy();
  }
  if (chartInstance2) {
    chartInstance2.destroy();
  }

  // First chart
  chartInstance = new Chart(ctx1, {
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
          backgroundColor: 'rgba(255,0,0,0.1)',
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
            font: { size: 10 },
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
        y: { min: 0, max: 100 },
        x: {
          title: { display: true, text: 'Atmospheric levels' },
          ticks: {
            font: {
              size: 8 // tamanho menor para o texto das datas
            }
          }
        }
      }
    }
  });

  // Second chart
  chartInstance1 = new Chart(ctx2, {
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
          font: { size: 10 },
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
      y: { min: 0, max: 10 },
      x: {
        title: { display: true, text: 'Nutrient Levels' },
        ticks: {
          font: {
            size: 8  // Diminui o tamanho da fonte das labels do eixo X
          }
        }
      }
    }
  }
  });

  // Third chart
  chartInstance2 = new Chart(ctx3, {
    type: 'line',
    data: {
      labels: chartIrrigationData.value,
      datasets: [
        {
          label: 'Dispenser nº1 (kg)',
          data: chart1Data.value,
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
          label: 'Dispenser nº2 (kg)',
          data: chart2Data.value,
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
          label: 'Dispenser nº3 (kg)',
          data: chart3Data.value,
          borderColor: 'red',
          backgroundColor: 'rgba(255,0,0,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 1.5,
          pointBackgroundColor: 'red',
          pointBorderColor: 'red',
          borderWidth: 1
        },
        {
          label: 'Dispenser nº4 (kg)',
          data: chart4Data.value,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 1.5,
          pointBackgroundColor: 'blue',
          pointBorderColor: 'blue',
          borderWidth: 1
        },
        {
          label: 'Dispenser nº5 (kg)',
          data: chart5Data.value,
          borderColor: 'purple',
          backgroundColor: 'rgba(128,0,128,0.1)',
          fill: true,
          tension: 0.3,
          pointStyle: 'circle',
          pointRadius: 1.5,
          pointBackgroundColor: 'purple',
          pointBorderColor: 'purple',
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
            font: { size: 10 },
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
        y: { min: 0, max: 100 },
        x: {
          title: { display: true, text: 'Irrigation levels' },
          ticks: {
            font: {
              size: 8  // texto menor no eixo X
            }
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
      // Ordena os dados por data crescente
      const sortedData = data.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      const latest = sortedData[sortedData.length - 1];

      temperature.value = latest.temperature;
      humidity.value = latest.humidity;
      Nitrogenio.value = latest.nitrogen;
      Fosforo.value = latest.phosphorus;
      Potassio.value = latest.potassium;

      // Pega os últimos 28 em ordem crescente
      const recent = sortedData.slice();

      chartLabels.value = recent.map(entry => {
        const date = new Date(entry.created_at);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${hours}:${minutes} ${day}-${month}-${year}`;
      });

      chartHumidityData.value = recent.map(entry => entry.humidity);
      chartTemperatureData.value = recent.map(entry => entry.temperature);
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

const refreshReadings1 = async () => {
  if (!deviceID.value) return;
  try {
    const res = await fetch(`https://soilsense-api.onrender.com/api/irrigation?device_id=${deviceID.value}`);
    const data = await res.json();
    console.log("REFRESH IRRIGATION RESPONSE:", data);

    if (data.success && data.data && data.data.length > 0) {
  const sortedData = data.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      chartIrrigationData.value = sortedData.map((entry, i) => `Day ${i + 1}`);
      chart1Data.value = sortedData.map(entry => entry.dispenser1);
      chart2Data.value = sortedData.map(entry => entry.dispenser2);
      chart3Data.value = sortedData.map(entry => entry.dispenser3);
      chart4Data.value = sortedData.map(entry => entry.dispenser4);
      chart5Data.value = sortedData.map(entry => entry.dispenser5);

      initChart();
    } else {
      console.warn("⚠️ No irrigation data returned from API");
    }
  } catch (error) {
    console.error("❌ Error fetching irrigation data:", error);
  }
};

///////////////////////////////////////////////////////////////////////////////
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

const saveIrrigationData = async () => {
  if (nutrients.value.length === 0) {
    alert("No irrigation data to save.");
    return;
  }

  try {
    for (const irrigationValues of nutrients.value) {
      const payload = {
        device_id: deviceID.value,
        water: irrigationValues[0].value,
        dispenser1: irrigationValues[1].value,
        dispenser2: irrigationValues[2].value,
        dispenser3: irrigationValues[3].value,
        dispenser4: irrigationValues[4].value,
        dispenser5: irrigationValues[5].value,
        created_at: new Date().toISOString()
      };

      const res = await fetch("https://soilsense-api.onrender.com/api/irrigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("SAVE IRRIGATION RESPONSE:", data);

      if (!data.success) {
        console.warn("Failed to save irrigation data for one entry.");
      }
    }

    alert("All irrigation data saved!");

    // Após guardar → atualiza o gráfico de irrigação
    await refreshReadings1();
  } catch (error) {
    console.error("❌ Error saving irrigation data:", error);
    alert("Error saving irrigation data.");
  }
};
///////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
</script>

<template>
  <main>
    
    <header>
      <img :src="logo" alt="SoilSense Logo" class="logo-img" />
      <h2>Hi, {{ email }} {{ firstName }} {{ lastName }}!</h2>
    </header>
    
    <div class="profile-circle" @click="Funcionalities">
      <img :src="question" alt="Adicionar dispositivo" />
    </div>

    <div class="add-device-circle" @click="addDevice">
      <img :src="plus" alt="Adicionar dispositivo" />
    </div>

    <div class="device-box">

      <h2 class="device-title"> Device: 1 {{ deviceID }}</h2>

      <template v-if="editMode">

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

          <button  class = "save" @click="saveIrrigationData">Save Irrigation Data</button>

        </div>
      </template>

      <template v-if="alarmMode">
        <div class="alerts-container">
          <h3>Alert History</h3>
          <ul class="alert-list">
            <li v-if="alerts.length === 0">No alerts found.</li>
            <li v-for="(alert, index) in alerts" :key="index">
              <strong>{{ alert.date }}:</strong> {{ alert.message }}
            </li>
          </ul>
        </div>
      </template>
      
      <template v-if="!editMode && !alarmMode">

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

        <div style="margin-top: 5rem; max-width: 1000px;">
          <canvas id="soilChart"></canvas>
          <canvas id="soilChart2"></canvas>
          <canvas id="soilChart3"></canvas>
        </div>

      </template>

      <div class="footer">
        <button class="edit-button" @click="toggleEdit">
          <img :src="lapis" alt="Editar dispositivo" />
        </button>
        <button class="alarm-button" @click="toggleAlarm">
          <img :src="alarme" alt="Editar dispositivo" />
        </button>
      </div>

    </div>

    <div class="logout-box">
      <input type="submit" value="Logout" @click="logout" />
    </div>

  </main>      
</template>


<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: var(--primary-dark);
  color: #F3F4F6;
  padding: 2rem;
}

header {
  padding: 1.5rem;
}

h2{
    font: 2.15rem;
    margin-top: 1rem;
}

h2 ~ p {
    font-weight: 500;
    font-size: 1rem;
    margin-top: 1rem;
}

.logo-img {
  width: 50px;
  height: auto;
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
  text-align: left;
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

.edit-button img, .alarm-button img { 
  width: 40px; 
  height: 40px; 
  object-fit: contain; 
}


.edit-button, .alarm-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--dark);
  transition: transform 0.2s;
}

.edit-button:hover, .alarm-button:hover {
  transform: scale(1.5);
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
  position:absolute;
  top: 4rem;
  right: 0rem;
  transform: translateX(-50%);
  z-index: 100;
}

.logout-box input[type="submit"] {
  font-size: 1.2rem;
  font-weight: 200;
  color: var(--light);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: 0.2s ease;
  border: none;
}

.logout-box input[type="submit"]:hover {
  box-shadow: 0px -4px 12px 4px rgba(0,0,0,0.16);
}


.profile-circle img, .add-device-circle img { 
  width: 24px; 
  height: 24px; 
  object-fit: contain; 
}

.profile-circle {
  position: fixed;
  bottom: 2rem;
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

.add-device-circle {
  position: fixed;
  bottom: 2rem;
  right: 6rem;
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

.profile-circle:hover, .add-device:hover {
  background-color: #f0f0f0;
}

.charts-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem; 
  width:"450";
  max-width: 1000px;
}

.charts-container canvas {
  width: 300px !important;
  height: 250px !important;
}

.footer {
  display: flex;
  justify-content: center; /* This centers the buttons horizontally */
  align-items: center;
  gap: 35%; /* Space between the buttons */
  margin-top: 2rem; /* Optional spacing from content above */
}

.alert-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alert-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.save {
  background-color: var(--primary-dark);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

</style>
