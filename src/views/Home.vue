<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const firstName = ref("");
const lastName = ref("");
const showSidebar = ref(false);

onMounted(() => {
  firstName.value = localStorage.getItem("first_name") || "";
  lastName.value = localStorage.getItem("last_name") || "";
});

const logout = async () => {
    const sessionToken = localStorage.getItem('session_token');

    if (!sessionToken) {
        alert("No session token found.");
        return;
    }

    const res = await fetch("http://localhost:3333/logout", {
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

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

const updateProfile = () => {
  router.push('/profile');
};

// Fecha sidebar ao clicar no overlay
const closeSidebar = () => {
  showSidebar.value = false;
};
</script>

<template>
  <main>
    <h1>Hello, {{ firstName }} {{ lastName }}!</h1>

    <button @click="toggleSidebar">SoilSense</button>

    <!-- Overlay que cobre a tela inteira -->
    <div 
      v-if="showSidebar" 
      class="overlay" 
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <div v-if="showSidebar" class="sidebar" @click.stop>
      <!-- @click.stop evita que o clique dentro da sidebar propague para o overlay -->
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
  z-index: 1001; /* maior que o overlay */
}

/* Overlay escurecido */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.3);
  z-index: 1000;
}
</style>
