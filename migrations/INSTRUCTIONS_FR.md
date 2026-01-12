# Instructions pour appliquer la migration

## Option 1: Via SSH (Recommandé)

Dans votre terminal SSH actif (`ssh root@197.140.16.200`), exécutez :

```bash
# 1. Naviguer vers le dossier migrations
cd /root/padel_Mindset/backend/migrations

# 2. Exécuter la migration directement avec psql
psql -U postgres -d padel_mindset << 'EOF'

-- Vérifier les doublons existants
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT id_plage_horaire, date, COUNT(*) as cnt
    FROM reservation
    WHERE "isCancel" = 0
    GROUP BY id_plage_horaire, date
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE WARNING 'Trouvé % réservations en double!', duplicate_count;
    -- Afficher les doublons
    FOR rec IN 
      SELECT id_plage_horaire, date, COUNT(*) as cnt, array_agg(id) as ids
      FROM reservation
      WHERE "isCancel" = 0
      GROUP BY id_plage_horaire, date
      HAVING COUNT(*) > 1
    LOOP
      RAISE NOTICE 'Slot: %, Date: %, Count: %, IDs: %', 
        rec.id_plage_horaire, rec.date, rec.cnt, rec.ids;
    END LOOP;
  ELSE
    RAISE NOTICE '✅ Aucun doublon trouvé';
  END IF;
END $$;

-- Supprimer l'ancienne contrainte si elle existe
DROP INDEX IF EXISTS uniq_private_plage_horaire;

-- Créer la contrainte unique
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_reservation_per_slot_date 
ON reservation (id_plage_horaire, date) 
WHERE "isCancel" = 0;

-- Ajouter la documentation
COMMENT ON INDEX uniq_active_reservation_per_slot_date IS 
'Empêche les réservations en double pour le même créneau et la même date';

-- Vérifier la création
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'uniq_active_reservation_per_slot_date'
    ) 
    THEN '✅ SUCCESS: Contrainte créée avec succès!'
    ELSE '❌ FAILED: La contrainte n''a pas été créée'
  END as status;

EOF
```

## Option 2: Utiliser le script bash

```bash
cd /root/padel_Mindset/backend/migrations
chmod +x apply_migration.sh
./apply_migration.sh
```

## Après la migration

1. **Redémarrer le serveur backend:**
   ```bash
   pm2 restart padel-backend
   # OU
   pm2 restart all
   ```

2. **Vérifier les logs:**
   ```bash
   pm2 logs padel-backend --lines 50
   ```

3. **Tester:**
   - Ouvrir l'app sur 2 appareils
   - Cliquer simultanément sur le même créneau
   - Le 2ème utilisateur devrait voir: "Ce créneau vient d'être réservé par un autre joueur"

## En cas de doublons existants

Si la migration trouve des doublons, annulez-les manuellement:

```sql
-- Voir les doublons
SELECT id_plage_horaire, date, COUNT(*), array_agg(id) as reservation_ids
FROM reservation
WHERE "isCancel" = 0
GROUP BY id_plage_horaire, date
HAVING COUNT(*) > 1;

-- Annuler une réservation en double (remplacer <ID> par l'ID à annuler)
UPDATE reservation SET "isCancel" = 1 WHERE id = <ID>;
```

Puis réexécutez la migration.
