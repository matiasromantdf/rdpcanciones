<template>
    <div>
        <ClientOnly>
            <PWAStatusBar />
            <PWAInstallPrompt />
        </ClientOnly>
        <MenuComponent />
        <slot />
    </div>
</template>