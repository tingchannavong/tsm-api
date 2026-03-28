# TSM API Documentation

## API Endpoints Summary

| No. | Method         | Endpoint                          | Auth | Params      | Query                                    | Body                                                           |
| --- | -------------- | --------------------------------- | ---- | ----------- | ---------------------------------------- | -------------------------------------------------------------- |
|     | **Auth**       |                                   |      |             |                                          |                                                                |
| 1   | POST           | `/api/auth/login`                 | -    | -           | -                                        | {username, password}                                           |
| 2   | GET            | `/api/auth/me`                    | y    | -           | -                                        | -                                                              |
| 3   | POST           | `/api/auth/register`              | y    | -           | -                                        | {username, password, email, firstname, lastname, phone}        |
| 4   | POST           | `/api/auth/register-invite`       | y    | -           | -                                        | {email}                                                        |
| 5   | POST           | `/api/auth/register/:token`       | -    | inviteToken | -                                        | {username, password, email, firstname, lastname, phone}        |
| 6   | POST           | `/api/auth/forgot-password`       | -    | -           | -                                        | {email}                                                        |
| 7   | POST           | `/api/auth/reset-password/:token` | -    | resetToken  | -                                        | {password, confirmPassword}                                    |
|     | **Sessions**   |                                   |      |             |                                          |                                                                |
| 8   | POST           | `/api/sessions`                   | -    | -           | -                                        | {locationId, groupId?, name, people, pricingId}                |
| 9   | GET            | `/api/sessions`                   | y    | -           | {groupId, locationId, status}            | -                                                              |
| 9.1 | GET            | `/api/sessions/filter`            | -    | -           | {locationId}                             | -                                                              |
| 10  | GET            | `/api/sessions/:id`               | -    | sessionId   | -                                        | -                                                              |
| 11  | PATCH          | `/api/sessions/:id`               | y    | sessionId   | -                                        | {status, name, startTime, endTime, updatedBy}                  |
| 12  | DELETE         | `/api/sessions/:id`               | y    | sessionId   | -                                        | -                                                              |
| 13  | PATCH          | `/api/sessions/groups/:id`        | y    | groupId     | -                                        | {status, locationId, startTime, endTime, pricingId, updatedBy} |
|     | **Orders**     |                                   |      |             |                                          |                                                                |
| 14  | POST           | `/api/orders/preview`             | y    | -           | -                                        | {sessionIds[]}                                                 |
| 15  | POST           | `/api/orders`                     | y    | -           | -                                        | {sessionIds[], discount, createdById}                          |
| 16  | GET            | `/api/orders`                     | y    | -           | {status, updatedById, createdById, page} | -                                                              |
| 17  | GET            | `/api/orders/:id`                 | y    | orderId     | -                                        | -                                                              |
| 18  | PATCH          | `/api/orders/:id`                 | y    | orderId     | -                                        | {status, updatedBy}                                            |
| 19  | DELETE         | `/api/orders/:id`                 | y    | orderId     | -                                        | -                                                              |
|     | **Locations**  |                                   |      |             |                                          |                                                                |
| 20  | POST           | `/api/locations`                  | y    | -           | -                                        | {name, displayName, qrCode}                                    |
| 21  | GET            | `/api/locations`                  | y    | -           | -                                        | -                                                              |
| 22  | PATCH          | `/api/locations/:id`              | y    | locationId  | -                                        | {name, displayName, qrCode}                                    |
| 23  | DELETE         | `/api/locations/:id`              | y    | locationId  | -                                        | -                                                              |
|     | **Pricing**    |                                   |      |             |                                          |                                                                |
| 24  | POST           | `/api/pricings`                   | y    | -           | -                                        | {name, price, unitId, currencyId}                              |
| 25  | GET            | `/api/pricings`                   | y    | -           | -                                        | -                                                              |
| 26  | PATCH          | `/api/pricings/:id`               | y    | pricingId   | -                                        | {name, price, unitId, currencyId}                              |
| 27  | DELETE         | `/api/pricings/:id`               | y    | pricingId   | -                                        | -                                                              |
|     | **Users**      |                                   |      |             |                                          |                                                                |
| 28  | GET            | `/api/users`                      | y    | -           | {search}                                 | -                                                              |
| 29  | GET            | `/api/users/:id`                  | y    | userId      | -                                        | -                                                              |
| 30  | PATCH          | `/api/users/:id`                  | y    | userId      | -                                        | {username, password, email, firstname, lastname, phone}        |
| 31  | DELETE         | `/api/users/:id`                  | y    | userId      | -                                        | -                                                              |
|     | **Units**      |                                   |      |             |                                          |                                                                |
| 32  | POST           | `/api/units`                      | y    | -           | -                                        | {name}                                                         |
| 33  | GET            | `/api/units`                      | y    | -           | -                                        | -                                                              |
| 34  | PATCH          | `/api/units/:id`                  | y    | unitId      | -                                        | {name}                                                         |
| 35  | DELETE         | `/api/units/:id`                  | y    | unitId      | -                                        | -                                                              |
|     | **Currencies** |                                   |      |             |                                          |                                                                |
| 36  | POST           | `/api/currencies`                 | y    | -           | -                                        | {name, code}                                                   |
| 37  | GET            | `/api/currencies`                 | y    | -           | -                                        | -                                                              |
| 38  | PATCH          | `/api/currencies/:id`             | y    | currencyId  | -                                        | {name, code}                                                   |
| 39  | DELETE         | `/api/currencies/:id`             | y    | currencyId  | -                                        | -                                                              |
