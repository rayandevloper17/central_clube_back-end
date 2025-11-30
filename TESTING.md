# Security Testing Checklist

## Test 1: User A cannot see User B's email
```bash
curl -H "Authorization: Bearer <UserA_Token>" http://localhost:300/api/reservations/my-reservations
# Should NOT contain any emails except User A's
```

## Test 2: User A cannot access User B's reservation
```bash
curl -H "Authorization: Bearer <UserA_Token>" http://localhost:300/api/reservations/<UserB_Reservation_ID>
# Should return 403 if not owner
```

## Test 3: Cannot create reservation without payment
```bash
curl -X POST -H "Authorization: Bearer <UserA_Token>" -d '{"terrain_id":1,"date":"2025-12-01","heure_debut":"10:00","heure_fin":"11:00"}' http://localhost:300/api/reservations/create
# Should return 402
```

## Test 4: Rate limiting works
```bash
for i in {1..10}; do curl -X POST -H "Authorization: Bearer <UserA_Token>" -d '{"terrain_id":1,"date":"2025-12-01","heure_debut":"10:00","heure_fin":"11:00","payment_id":123}' http://localhost:300/api/reservations/create; done
# Should block after 5 requests/hour
```

## Test 5: Maintenance mode
```bash
curl http://localhost:300/api/terrains
# Should return 503 (except for admin)
```

## Test 6: Public available slots endpoint
```bash
curl http://localhost:300/api/reservations/available-slots?terrain_id=1&date=2025-12-01
# Should return ONLY occupied slots, NO user info
```

## Test 7: Admin endpoints
```bash
curl -H "Authorization: Bearer <Admin_Token>" http://localhost:300/api/admin/reservations
# Should return all reservations with user details
```
