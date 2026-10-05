const BASE = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/registration-order'
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

async function call(action, body) {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ action, ...body }),
})

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
        return data

}

export const registrationApi = {
    createDraft: (values)               => call('draft',    { values }), //{OrderId }
    verifyOtp: (orderId, code)          => call('otp',      { orderId, code }),
    confirmOrder: (orderId, students)   => call('confirm',   { orderId, students }), // { total_minor, payment_url }


}
