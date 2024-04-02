<script lang="ts" setup>
    import { onMounted, ref } from 'vue';
    import type { Ref } from 'vue';
    import type { IProduct } from "~/schemas"
    import type { IAudit } from "~/schemas"


    const route = useRoute();
    const toast = useToast();
    const productCode = route.params.code;
    const sessionToken = useCookie("sessionToken");
    const isAuth = useCookie("isAuth", {default: () => false});
    const runtimeConfig = useRuntimeConfig();
    const seeChangesModal = ref(false);
    const productChanges: Ref<IAudit[]> = ref([])
    const { BACK_API_PORT } = runtimeConfig.public;

    type changeRow = {code: number, name: string, updatedAt: string, changeId: string}

    const columns = [
        {sortable: true, key: "updatedAt", label: "Date of update"},
    ]

    const changes: Ref<changeRow[]> = ref([])

    const product: Ref<IProduct> = ref({} as IProduct)

    const change: Ref<IAudit> = ref({} as IAudit)

    async function getProduct() {

        try {
            const response = await fetch(
            "http://localhost:" +
                BACK_API_PORT +
                "/products/getAProduct?productCode=" +
                productCode,
            {
                headers: {
                    authorization: String(sessionToken.value),
                },
            }
            );

            const jsonResponse = await response.json();

            console.log({
                jsonResponse,
            });

            if (jsonResponse.errorMessage) throw jsonResponse.errorMessage;

            product.value = jsonResponse.product as IProduct;

        } catch (err) {

            toast.add({
                title: "Error getting the product " + err,
            });

            if (/jwt expired/.test(err as string)) {

                isAuth.value = false;

                sessionToken.value = "";

                window.location.href = "/";

            }
        }

    }

    async function getHistoryChanges() {
        try {
            const response = await fetch(
                "http://localhost:" +
                    BACK_API_PORT +
                    "/products/changes?productCode=" +
                    productCode,
                {
                    headers: {
                        authorization: String(sessionToken.value),
                    },
                }
            );

            const jsonResponse = await response.json();

            console.log({
                jsonResponse,
            });

            if (jsonResponse.errorMessage) throw jsonResponse.errorMessage;

            productChanges.value = jsonResponse.changes as IAudit[]

            changes.value = (jsonResponse.changes as IAudit[]).map(change => {

                return {
                    code: product.value.code,
                    name: product.value.name,
                    updatedAt: change.updatedAt,
                    changeId: change._id
                }
            }).sort((a, b) => {
                let dateA = new Date(a.updatedAt).getTime();
                let dateB = new Date(b.updatedAt).getTime();
                return dateB - dateA;
            });;

        } catch (err) {

            toast.add({
                title: "Error getting the product history " + err,
            });

            if (/jwt expired/.test(err as string)) {

                isAuth.value = false;

                sessionToken.value = "";

                window.location.href = "/";

            }
        }
    }

    onMounted(async () => {

        await getProduct()
        await getHistoryChanges()

    })

    const tabs = [
        {
            key: 'from',
            label: 'From',
            description: 'Product data before changes'
        },
        {
            key: 'to',
            label: 'To',
            description: 'Product data after changes'
        }
    ]

    async function onSelect(row: changeRow) {

        const changeFound = productChanges.value.find((productChange) => productChange._id === row.changeId)

        change.value = changeFound as IAudit

        console.log({change: change.value})

        seeChangesModal.value = true

    }

</script>
<template>
    
    <UContainer class="mt-4 p-4">
        <UButton
            :to="'/products/' + productCode"
            color="blue"
            label="⬅️ Product"
            class="justify-center"
        />
    </UContainer>

    <UContainer>

        <h1 class="text-2xl">Product change history</h1>
        <h2 class="text-lg">Product name: <span class="font-extrabold">{{ product.name }}</span></h2>
        <h2 class="text-lg">Product code: <span class="font-extrabold">{{ productCode }}</span></h2>

        <h3 class="text-lg">Click a date to see details</h3>

    </UContainer>

    <UContainer>

        <UTable :rows="changes" :columns="columns" @select="onSelect">
            <template #empty-state>
                <div class="flex flex-col items-center justify-center py-6 gap-3">
                    <span class="italic text-sm">No changes</span>
                </div>
            </template>
        </UTable>

    </UContainer>

    <UModal v-model="seeChangesModal">

        <UCard>

            <template #header>

                <p class="text-2xl text-center">Product data modified</p>
                <p class="text-xs text-center">Change id: {{ change._id }}</p>

            </template>

            <ul>
                <li v-for="(update, key) in change.changes" :key="key">
                    <strong>{{ key }}:</strong> From "<strong>{{ update.from }}</strong>" To "<strong>{{ update.to }}</strong>"
                </li>
            </ul>

        </UCard>
    

    </UModal>

</template>