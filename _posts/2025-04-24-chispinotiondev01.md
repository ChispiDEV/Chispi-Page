---
layout: post
title: "Iniciando el DevBlog - Semana 1"
subtitle: "Primera semana del DevBlog.\n Conecto Notion con mi blog y exporto mis posts automáticamente usando Python."
date: 2025-04-24
tags: ["GitHub"]
slug: "chispinotiondev01"
mood: ["Motivada"]
issues: "1. Error en el tipo de propiedad de la sección “Estado” → Cambiar en el script la propiedad buscada \n 2. El contenido no se escribía en el archivo .md → Modificar script para que lea el texto del apartado, comentar la sección del script en el que se genera el contenido de forma dinámica \n"
resources:  []
projects: ["Chispi-DevLog"]
publish: true
status: "Publicado"
background: "/img/posts/post-01.jpg"  # Aquí agregamos el campo de fondo
---

Buenos días!

Soy Cristina Fuentes, analista de datos y bióloga. He creado este Blog para poder tener un seguimiento de mis avances en programación y análisis de datos 😉 

En esta primera entrada voy a recoger los avances realizados en el desarrollo de los scripts necesarios para generar las entradas del blog en Notion y que se actualicen en GitHub. 

Por un lado, he generado en Notion una base de datos en la que se almacena la información de los proyectos (la podéis ver aquí), ordenando la información y creando las categorías necesarias para poder incorporarlas al script principal. 

Posteriormente generé el script de Python (del que hay una copia para usar de plantilla en la sección de recursos) que transforma la información de la base de datos en un archivo .md que se utilizará en los posts. 

A continuación creé un repositorio público con GitHub Pages integrado para que hubiera un lugar donde publicar las entradas. 

Para poner bonita la página, utilicé Jeckyll que también tiene integración con GitHub. 

Por último modifiqué el script que generaba los archivos .md para que también agregara una copia a la carpeta de _posts del repositorio, permitiendo que las entradas se actualicen de forma automática. 

Y de momento esto es todo por hoy. 

Un amable saludo y nos vemos en la próxima entrada. 

Cristina
