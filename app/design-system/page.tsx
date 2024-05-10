"use client";
import * as AlertNotice from "@/components/AlertNotice";
import type { AlertNoticeProps } from "@/components/AlertNotice";
import Button from "@/components/Button";
import { useState } from "react";
import Style from "./page.module.css";
export default function Page() {
  const [alerts, setAlerts] = useState<
    {
      status: AlertNoticeProps["status"];
      level: AlertNoticeProps["level"];
      title?: string;
      dismissible: boolean;
    }[]
  >([
    {
      status: "info",
      title: "Information",
      level: "page",
      dismissible: true,
    },
    {
      status: "warning",
      title: "Information",
      level: "page",
      dismissible: true,
    },
    {
      status: "danger",
      title: "Information",
      level: "page",
      dismissible: false,
    },
    {
      status: "success",
      title: "Information",
      level: "page",
      dismissible: false,
    },
    {
      status: "info",
      title: "Information",
      level: "section",
      dismissible: true,
    },
    {
      status: "warning",
      title: "Information",
      level: "section",
      dismissible: true,
    },
    {
      status: "danger",
      title: "Information",
      level: "section",
      dismissible: true,
    },
    {
      status: "success",
      level: "section",
      dismissible: true,
    },
    {
      status: "info",
      level: "inline",
      dismissible: false,
    },
    {
      status: "warning",
      level: "inline",
      dismissible: false,
    },
    {
      status: "danger",
      level: "inline",
      dismissible: false,
    },
    {
      status: "success",
      level: "inline",
      dismissible: false,
    },
  ]);

  const onDismiss = (e) => {
    const alert = alerts[e.currentTarget.dataset.index];
    // Remove the alert from the list of alerts
    setAlerts((alerts) => alerts.filter((a) => a !== alert));
    console.log("Dismissed alert", alert, e.currentTarget.dataset.index);
  };

  return (
    <>
      <section>
        <h1>Design System</h1>
        {/* <input type="text" placeholder="Search" />
      <h2>Alerts</h2>
      {alerts.map((alert, index) => (
        <AlertNotice.Container
          key={index}
          index={index}
          status={alert.status}
          level={alert.level}
          dismissible={alert.dismissible}
          onDismiss={onDismiss}
        >
          {alert && <AlertNotice.Icon status={alert.status} />}
          {alert && <AlertNotice.Title> {alert.title}</AlertNotice.Title>}
          <AlertNotice.BodyContent>
            <p className="body-01">
              This is a <strong>{alert.level}</strong> level{" "}
              <strong>{alert.status}</strong> alert
            </p>
          </AlertNotice.BodyContent>
        </AlertNotice.Container>
      ))} */}
      </section>
      <section>
        <h2>Work in progress, gonna be cool, I swear 😘</h2>
        {/* <h2>Buttons</h2>
        <table className={Style.table}>
          <thead>
            <tr>
              <th>Variant</th>
              <th>Small</th>
              <th>Medium</th>
              <th>Large</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Primary</th>
              <td>
                <div>
                  <div>
                    <Button variant="primary" size="small">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>
                    </Button>
                  </div>
                  <div>
                    <Button variant="primary" size="small">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>{" "}
                      Twitter
                    </Button>
                  </div>
                  <div>
                    <Button variant="primary" size="small">
                      Twitter
                    </Button>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div>
                    <Button variant="primary">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>
                    </Button>
                  </div>
                  <div>
                    <Button variant="primary">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>{" "}
                      Twitter
                    </Button>
                  </div>
                  <div>
                    <Button variant="primary" size="medium">
                      Twitter
                    </Button>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div>
                    <Button variant="primary" size="large">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>
                    </Button>
                  </div>
                  <div>
                    <Button variant="primary" size="large">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>{" "}
                      Twitter
                    </Button>
                  </div>
                  <div>
                    <Button variant="primary" size="large">
                      Twitter
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th>Secondary</th>
              <td>
                <div>
                  <div>
                    <Button variant="secondary" size="small">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>
                    </Button>
                  </div>
                  <div>
                    <Button variant="secondary" size="small">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>{" "}
                      Twitter
                    </Button>
                  </div>
                  <div>
                    <Button variant="secondary" size="small">
                      Twitter
                    </Button>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div>
                    <Button variant="secondary">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>
                    </Button>
                  </div>
                  <div>
                    <Button variant="secondary">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>{" "}
                      Twitter
                    </Button>
                  </div>
                  <div>
                    <Button variant="secondary" size="medium">
                      Twitter
                    </Button>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div>
                    <Button variant="secondary" size="large">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>
                    </Button>
                  </div>
                  <div>
                    <Button variant="secondary" size="large">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>{" "}
                      Twitter
                    </Button>
                  </div>
                  <div>
                    <Button variant="secondary" size="large">
                      Twitter
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th>Tertiary</th>
              <td>
                <div>
                  <div>
                    <Button variant="tertiary" size="small">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>
                    </Button>
                  </div>
                  <div>
                    <Button variant="tertiary" size="small">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>{" "}
                      Twitter
                    </Button>
                  </div>
                  <div>
                    <Button variant="tertiary" size="small">
                      Twitter
                    </Button>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div>
                    <Button variant="tertiary">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>
                    </Button>
                  </div>
                  <div>
                    <Button variant="tertiary">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>{" "}
                      Twitter
                    </Button>
                  </div>
                  <div>
                    <Button variant="tertiary" size="medium">
                      Twitter
                    </Button>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div>
                    <Button variant="tertiary" size="large">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>
                    </Button>
                  </div>
                  <div>
                    <Button variant="tertiary" size="large">
                      <i className="fab fa-twitter" aria-label="Twitter">
                        <span>Twitter</span>
                      </i>{" "}
                      Twitter
                    </Button>
                  </div>
                  <div>
                    <Button variant="tertiary" size="large">
                      Twitter
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table> */}
      </section>
    </>
  );
}
