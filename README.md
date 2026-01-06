# WebTechUE-WS25-Gruppe-IX
<small> Pozewaunig, Wibmer, Müllauer</small>

### MVVM pattern is as follows:
- Backend queries DB with prepared statement (Model)
- Backend serializes data to canonical DTO (ModelView)
- Frontend obtains data as JSON through HTTPS REST "Services" (ModelView)
- Frontend injects data as primitives into template-components (View)

>Both share canonical dto imposed by /shared/ folder, only backend implements serialization

`:seal: garantiert`
<small>Disclaimer: Wenn das nicht Angular-Idiomatic ist liegt das daran, dass ich bei der Arbeit in Python es so mache ;)</small>
