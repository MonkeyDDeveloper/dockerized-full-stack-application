<script lang="ts" setup>
    import { onMounted, ref } from 'vue';
    import type { ICategory } from "~/schemas"
    import type { IProduct } from '~/schemas'
    import type { FormSubmitEvent } from "#ui/types"
    import { z } from "zod"

    const toast = useToast()
    const isAuth = useCookie("isAuth", {default: () => false})
    const sessionToken = useCookie("sessionToken")
    const runtimeConfig = useRuntimeConfig();
    const categories = ref()
    const { BACK_API_PORT } = runtimeConfig.public

    const schema = z.object({
        name: z.string(),
        code: z.number(),
        hasStock: z.boolean(),
        category: z.string(),
    }).partial()

    type Schema = z.output<typeof schema>

    const applyFilters = reactive({
        applyCode: false,
        applyCategory: false,
        applyHasStock: false,
        applyName: false,
    })

    const queryFilters = reactive({
        code: 0,
        category: "",
        hasStock: false,
        name: "",
    })


    definePageMeta({

        middleware: 'auth'

    })

    const columns = [
        {sortable: true, key: "code", label: "Code"},
        {sortable: true, key: "name", label: "Name"},
        {sortable: true, key: "category", label: "Category"},
        {sortable: true, key: "hasStock", label: "Available"},
        {sortable: true, key: "stock", label: "Stock"},
        {sortable: true, key: "measurementType", label: "Measurement"},
    ]

    const products = ref([])

    onMounted(async () => {

        try {

            const response = await fetch("http://localhost:" + BACK_API_PORT + "/products/", {
                method: 'get',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `${sessionToken.value}`
                }
            })
    
            const jsonResponse = await response.json()

            if(jsonResponse.errorMessage) throw jsonResponse.errorMessage

            products.value = jsonResponse.products

        } catch(err) {

            console.log({err})

            toast.add({
                title: "Error getting the products" + err,
                description: "Try loggin again"
            })

            if(/jwt expired/.test(err as string as string)) {

                isAuth.value = false
    
                sessionToken.value = ""
    
                window.location.href = "/"

            }

        }

    })

    onMounted(async () => {

        try {

            const response = await fetch("http://localhost:" + BACK_API_PORT + "/products/categories", {
                headers: {
                    'authorization': String(sessionToken.value)
                }
            })
            const jsonResponse = await response.json()

            if(jsonResponse.errorMessage) throw jsonResponse.errorMessage

            categories.value = (jsonResponse.categories as ICategory[]).map(categorie => categorie.name)

        }
        catch(err) {

            toast.add({
                title: "Error getting the categories options " + err
            })

            if(/jwt expired/.test(err as string as string)) {

                isAuth.value = false

                sessionToken.value = ""

                window.location.href = "/"

            }

        }

    })

    function onSelect(row: IProduct) {

        navigateTo("/products/" + row.code)

    }

    async function searchProducts(event: FormSubmitEvent<Schema>) {

        const queryFilter: {code?: number, category?: string, name?: string, hasStock?: boolean} = {}

        if (applyFilters.applyCode) queryFilter.code = event.data.code
        if (applyFilters.applyCategory) queryFilter.category = event.data.category
        if (applyFilters.applyName) queryFilter.name = event.data.name
        if (applyFilters.applyHasStock) queryFilter.hasStock = event.data.hasStock

        try {

            const response = await fetch("http://localhost:" + BACK_API_PORT + "/products/getProducts", {
                method: 'post',
                headers: {
                    'Content-type': 'application/json',
                    'authorization': String(sessionToken.value)
                },
                body: JSON.stringify({
                    queryFilter
                })
            })

            const jsonResponse = await response.json()

            console.log({jsonResponse})

            if(jsonResponse.errorMessage) throw jsonResponse.errorMessage

            products.value = jsonResponse.products

        }
        catch(err) {

            toast.add({
                title: "Error filtering the products " + err
            })

            if(/jwt expired/.test(err as string as string)) {

                isAuth.value = false

                sessionToken.value = ""

                window.location.href = "/"

            }

        }
        
    }

</script>
<template>
    <UContainer class="mt-4 p-4">

        <UButton to="/dashboard" color="blue" label="⬅️ Dashboard" class="justify-center" />

    </UContainer>
    <UContainer class="mt-4 p-4">
        <h1 class="text-2xl font-extrabold">All products</h1>
        <p class="text-lg">Click one to edit or delete</p>
    </UContainer>
    <UContainer class="mt-4 p-4">

        <h2 class="text-lg">Apply filters</h2>

        <UCheckbox class="my-2" v-model="applyFilters.applyCode" label="Apply code filter" />
        <UCheckbox class="my-2" v-model="applyFilters.applyName" label="Apply name filter" />
        <UCheckbox class="my-2" v-model="applyFilters.applyHasStock" label="Apply hasStock filter" />
        <UCheckbox class="my-2" v-model="applyFilters.applyCategory" label="Apply category filter" />

        <UContainer class="my-2">

            <UForm :state="queryFilters" :schema="schema" @submit="searchProducts">

                <UFormGroup v-if="applyFilters.applyCode" class="my-2" label="Code" name="code">

                    <UInput :disabled="!applyFilters.applyCode" type="number" v-model="queryFilters.code"></UInput>

                </UFormGroup>

                <UFormGroup v-if="applyFilters.applyName" class="my-2" label="Name" name="name">

                    <UInput :disabled="!applyFilters.applyName" type="text" v-model="queryFilters.name"></UInput>

                </UFormGroup>

                <UFormGroup v-if="applyFilters.applyHasStock" class="my-2" label="Has Stock" name="hasStock">

                    <UToggle :disabled="!applyFilters.applyHasStock" v-model="queryFilters.hasStock" label="Has Stock" />

                </UFormGroup>

                <UFormGroup v-if="applyFilters.applyCategory" class="my-2" label="Category" name="category">

                    <USelect
                        :disabled="!applyFilters.applyCategory"
                        v-model="queryFilters.category"
                        color="primary"
                        variant="outline"
                        :options="categories"
                    />

                </UFormGroup>

                <UButton type="submit" class="my-2">
                    Search
                </UButton>

            </UForm>

        </UContainer>

    </UContainer>
    <UTable :rows="products" :columns="columns" @select="onSelect">
        <template #empty-state>
            <div class="flex flex-col items-center justify-center py-6 gap-3">
                <span class="italic text-sm">No products here!</span>
                <UButton to="/products/addProduct" label="Add products" />
            </div>
        </template>
    </UTable>
</template>