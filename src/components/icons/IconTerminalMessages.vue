<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Terminal window -->
    <rect x="3.5" y="4.5" width="17" height="13" rx="2.2" stroke="currentColor" stroke-width="1.5" />
    <path d="M3.5 8.5H20.5" stroke="currentColor" stroke-width="1.5" />

    <!-- Prompt + lines -->
    <path d="M7 11L9 12.5L7 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M11 12.5H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M7 16H13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.9" />

    <!-- Message pulse -->
    <circle cx="18" cy="16.5" r="1.6" fill="currentColor" opacity="0.85" />
  </svg>
</template>
