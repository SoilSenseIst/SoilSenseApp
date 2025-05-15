import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import('./views/Home.vue'),
        meta: {
            requiresAuth: true
        }
    },
    {
        path: "/login",
        name: "Login",
        component: () => import('./views/Login.vue'),
    },
    {
        path: "/register",
        name: "Register",
        component: () => import('./views/Register.vue'),
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('./views/Profile.vue') 
    },

]

const router = createRouter ({
    history: createWebHashHistory(), 
    routes
})


router.beforeEach(async(to, from, next) => {
    if(to.matched.some(record => record.meta.requiresAuth)){
        //Authentication check
        const token = localStorage.getItem('token')

        if(token) {
            //check if the token is valid
            return next()
        }

        return next('/login')
    }
    next()
})

export default router