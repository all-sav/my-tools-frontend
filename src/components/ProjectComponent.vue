<template>
  <div>
    <h2>📁 Project Structure</h2>
    <p>Текущая структура проекта (пример):</p>
    <pre>
my-project/
 ├── .idea/
 ├── src/
 │    ├── Controller/
 │    │    └── IndexController.php
 │    ├── Entity/
 │    │    └── User.php
 │    └── Repository/
 ├── templates/
 │    └── base.html.twig
 ├── config/
 │    └── routes.yaml
 ├── public/
 │    └── index.php
 └── composer.json
    </pre>
    <p><span class="tag">// 12 файлов, 3 папки</span></p>
  </div>
</template>

<script setup>
// Логика компонента
</script>

<style scoped>
.tag {
  color: #6a8759;
}
</style>