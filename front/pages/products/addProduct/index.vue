<script lang="ts" setup>

    import { reactive } from "vue";
    import { z } from "zod"
    import type { ICategory } from "~/schemas"
    import type { FormSubmitEvent } from "#ui/types"

    const toast = useToast()
    const sessionToken = useCookie("sessionToken")
    const isAuth = useCookie("isAuth", {default: () => false})
    const runtimeConfig = useRuntimeConfig();
    const { BACK_API_PORT } = runtimeConfig.public
    const categories = ref()

    const schema = z.object({
        name: z.string().min(1, "Enter a name for the product"),
        code: z.number({required_error: "Enter a code for the product"}),
        stock: z.number().min(0, "Enter a stock number for the product"),
        measurementType: z.string().min(1, "Select a measurement type"),
        category: z.string().min(1, "Select a category"),
    })

    type Schema = z.output<typeof schema>

    const state = reactive({
        name: "",
        code: 0,
        stock: 0,
        measurementType: "",
        category : "",
    })

    async function onSubmit(event: FormSubmitEvent<Schema>) {

        try {

            const response = await fetch("http://localhost:" + BACK_API_PORT + "/products/addProduct", {
                method: 'post',
                headers: {
                    'Content-type': 'application/json',
                    'authorization': String(sessionToken.value)
                },
                body: JSON.stringify({
                    ...event.data,
                    hasStock: event.data.stock > 0
                })
            })

            const jsonResponse = await response.json()

            if(jsonResponse.errorMessage) throw jsonResponse.errorMessage

            toast.add({
                title: "Product created successfully"
            })

            state.category = ""
            state.code = 0
            state.measurementType = ""
            state.name = ""
            state.stock = 0

        }
        catch(err) {

            toast.add({
                title: "Error creating the product" + err
            })

            if(/jwt expired/.test(err as string)) {

                isAuth.value = false

                sessionToken.value = ""

                window.location.href = "/"

            }

        }

    }

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

            if(/jwt expired/.test(err as string)) {

                isAuth.value = false

                sessionToken.value = ""

                window.location.href = "/"

            }

        }

    })

</script>
<template>

    <UContainer class="mt-4 p-4">

        <UButton to="/dashboard" color="blue" label="⬅️ Dashboard" class="justify-center" />

    </UContainer>

    <UContainer class="mt-4 p-4">

        <h1 class="text-2xl">Add a new product</h1>

    </UContainer>

    <UContainer class="mt-4">

        <UForm :state="state" :schema="schema" @submit="onSubmit">
        
            <UFormGroup class="mt-2" label="Name" name="name">

                <UInput type="string" v-model="state.name" />

            </UFormGroup>

            <UFormGroup class="mt-2" label="Code" name="code">

                <UInput type="number" v-model="state.code" />

            </UFormGroup>

            <UFormGroup class="mt-2" label="Stock" name="stock">

                <UInput type="number" v-model="state.stock" />

            </UFormGroup>

            <UFormGroup class="mt-2" label="Measurement" name="measurementType">

                <USelect
                    v-model="state.measurementType"
                    color="primary"
                    variant="outline"
                    :options="['lb', 'Kg']"
                />

            </UFormGroup>

            <UFormGroup class="mt-2" label="Category" name="category">

                <USelect
                    v-model="state.category"
                    color="primary"
                    variant="outline"
                    :options="categories"
                />

            </UFormGroup>

            <UButton class="mt-2" type="submit">

                Create product

            </UButton>

        </UForm>

    </UContainer>

</template>