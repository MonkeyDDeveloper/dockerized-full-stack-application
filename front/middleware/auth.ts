export default defineNuxtRouteMiddleware(async (to, from) => {

    const isAuth = useCookie("isAuth", {default: () => false})

    function isAuthenticated(): boolean {

        return isAuth.value as unknown as boolean
        
    }
    

    if(!isAuthenticated()) {

        return navigateTo('/')

    }

})