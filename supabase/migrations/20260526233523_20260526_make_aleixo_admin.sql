/*
  # Tornar aleixo774@gmail.com administrador

  1. Contexto
    - O usuário com email "aleixo774@gmail.com" precisa de acesso total como admin
    - Esta migração insere o role 'admin' para este usuário
  
  2. Mudanças
    - Insere role 'admin' na tabela user_roles para o user_id correspondente ao email
  
  3. Segurança
    - Migração segura que verifica se o usuário existe antes de inserir
    - Usa ON CONFLICT para evitar duplicatas
*/

INSERT INTO user_roles (user_id, role)
SELECT 
  u.id,
  'admin'
FROM auth.users u
WHERE u.email = 'aleixo774@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;