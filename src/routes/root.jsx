import {
  Form,
  Link,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { createContact, getContacts } from "../contacts";
import { useEffect } from "react";

//загрузка всех контактов (запрос) и поиск (вытаскиваем то, что ищем из урла)
export async function loader({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);

  return { contacts, q };
}

//загрузка одного контакта (запрос)
export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export default function Root() {
  const { contacts, q } = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();

  // когда происходит поиск (переход на другой урл) - появляется спинер
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  // чтобы поле поиска очищалось если нажать кнопку Назад
  useEffect(() => {
    document.getElementById("q").value = q;
  }, [q]);

  return (
    <>
      <div id="sidebar">
        <h1>React Router Contacts</h1>
        <div>
          <Form id="search-form" role="search">
            <input
              id="q"
              className={searching ? "loading" : ""}
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
              defaultValue={q}
              // поиск происходит сразу при заполнении букв, а не при отправке всего поискового слова (submit(event.currentTarget.form);)
              onChange={(event) => {
                // submit(event.currentTarget.form);
                //этим убрали историю поиска?? или не про то...
                const isFirstSearch = q == null;
                submit(event.currentTarget.form, {
                  replace: !isFirstSearch,
                });
              }}
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>{" "}
          </Form>
          {/* <form id="search-form" role="search">
        
          </form>
          <form method="post">
            <button type="submit">New</button>
          </form> */}
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div
        id="detail"
        // это сделано для того, что когда мы нажимаем на кнопку слева - происходила некоторая задержка, куда можно вставить лоадер, например (карточка становится серой)
        className={navigation.state === "loading" ? "loading" : ""}
      >
        {/* с помощью Outlet показываем, куда именно вставлям children роута */}
        <Outlet />
      </div>
    </>
  );
}
