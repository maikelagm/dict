import { headers } from "next/headers";

interface User {
  name: string;
  lastnames: string;
  email: string;
  role: string;
  area: string;
  apto: string;
  image: string;
}

// [ ] TODO: Implement this function with real data from UCI services.
/** Lo normal seria que el servidor de autenticacion devuelva un objeto con los
 *  datos del usuario pero como el CAS de la UCI no devuelve estos datos, hay
 *  que obtener los datos de los usuarios de alguna otra forma, en este caso se
 *  simula que se obtienen los datos de un servicio externo
 */
export async function extendUserObject(
  user:
    | {
        id: string;
      }
    | ({
        id: string;
      } & User),
): Promise<User | null> {
  const exampleUsersData: Record<string, User> = {
    maikelagm: {
      name: "Maikel Alejandro",
      lastnames: "González Morejón",
      email: "maikelagm@estudiantes.uci.cu",
      role: "Estudiante",
      area: "Facultad 2",
      apto: "Apto 135305",
      image: `${headers().get("x-forwarded-proto") + "://" + headers().get("host")}/assets/avatars/maikelagm.png`,
    },
    olayad: {
      name: "Olaya Deysis",
      lastnames: "Perez Lopez",
      email: "olayad@estudiantes.uci.cu",
      role: "Estudiante",
      area: "Facultad 1",
      apto: "Apto 109101",
      image: `${headers().get("x-forwarded-proto") + "://" + headers().get("host")}/assets/avatars/olayad.png`,
    },
  };

  // Simula una demora de 300ms
  await new Promise((resolve) => setTimeout(resolve, 300));

  const userData = exampleUsersData[user.id];

  if (userData) {
    (user as User).name = userData.name + " " + userData.lastnames;
    (user as User).email = userData.email;
    (user as User).role = userData.role;
    (user as User).area = userData.area;
    (user as User).apto = userData.apto;
    (user as User).image = userData.image;
    return user as { id: string } & User;
  }
  console.error(`User with id ${user.id} not found in users data.`);
  return null;
}
